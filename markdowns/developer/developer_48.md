# Force-quit Mac LaunchAgents apps with bundle id

## Choose the right control

| What you want to do | What to use |
| --- | --- |
| Quit a responsive app | Press **Command–Q** or choose **Quit** from the app menu. |
| Close a frozen app | Press **Option–Command–Esc**, select the app, and click **Force Quit**. Unsaved work can be lost. |
| Stop a known background process | In **Activity Monitor**, select it, click the stop button, and try **Quit** first. |
| Interrupt a command running in Terminal | Press **Control–C** in that Terminal tab. |
| Change what opens at sign-in | Use **System Settings → General → Login Items** and look under **Open at Login**. |
| Inspect or unload a known LaunchAgent | Use `launchctl` with the job’s label or the exact path to its `.plist`. |

[Apple’s Force Quit guide](https://support.apple.com/en-us/102586) · [Activity Monitor guide](https://support.apple.com/en-us/guide/activity-monitor/actmntr1002/mac) · [Apple’s login items guide](https://support.apple.com/en-mt/guide/mac-help/mh15189/27/mac/27)

## Find the app bundle ID and launch-agent label

An app’s **bundle ID** is the `CFBundleIdentifier` in the app’s `Contents/Info.plist`. A LaunchAgent’s **job label** is the `Label` in its own `.plist`. For example, DingTalk’s bundle ID is `com.alibaba.DingTalkMac`. The GlobalProtect app’s bundle ID is `com.paloaltonetworks.GlobalProtect.client` and its menu-bar job’s label is `com.paloaltonetworks.gp.pangpa`.

```sh
plutil -extract CFBundleIdentifier raw "/Applications/DingTalk.app/Contents/Info.plist"
plutil -extract CFBundleIdentifier raw "/Applications/GlobalProtect.app/Contents/Info.plist"
```

To find an app’s LaunchAgent, inspect the agent’s `Program` or `ProgramArguments` for a path inside the app bundle. Some agents also declare the owning app in `AssociatedBundleIdentifiers`. This example searches the third-party LaunchAgents folder for the GlobalProtect menu-bar executable and prints the matching file and label. [Apple’s helper documentation](https://developer.apple.com/documentation/servicemanagement/updating-helper-executables-from-earlier-versions-of-macos)

```sh
for plist in /Library/LaunchAgents/*.plist; do
  if plutil -p "$plist" | grep -Fq '/Applications/GlobalProtect.app/Contents/MacOS/GlobalProtect'; then
    printf '%s\n' "$plist"
    plutil -extract Label raw "$plist"
  fi
done
```

On this Mac, the match is `/Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist`. Use `plutil -p` to read its settings.

```sh
plutil -p /Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist
```

| Key | What it means in this file |
| --- | --- |
| `Label` | Identifies the job to `launchctl`. |
| `Program` | Points to the GlobalProtect menu-bar executable. |
| `LimitLoadToSessionType` | `Aqua` limits this agent to a graphical login session. |
| `RunAtLoad` | Starts the program when the job loads. |
| `KeepAlive` | Lets `launchd` restart the program after it exits, which explains why Force Quit can be temporary. |

When copying Terminal examples, leave out the prompt’s `%`. A bold `%` immediately after file output is zsh’s marker for a missing final newline.

## List LaunchAgents and login items

The standard LaunchAgents folders are `/System/Library/LaunchAgents` for Apple’s agents, `/Library/LaunchAgents` for agents installed for all users, and `~/Library/LaunchAgents` for your account. This command reads the actual label from each file, including jobs that are currently unloaded. [Apple’s launchd guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html)

```sh
find /System/Library/LaunchAgents /Library/LaunchAgents \
  "$HOME/Library/LaunchAgents" -maxdepth 1 -name '*.plist' 2>/dev/null |
while IFS= read -r plist; do
  label=$(plutil -extract Label raw "$plist" 2>/dev/null) || continue
  printf '%s\t%s\n' "$label" "$plist"
done | sort
```

- Run `launchctl list` for jobs loaded in your Terminal’s launchd context. A dash in the PID column means the job is loaded and has no running process.
- Run `sfltool dumpbtm` to inspect login items and background registrations, including helpers registered from inside app bundles. macOS may ask for administrator authentication. [Apple’s background-task guide](https://support.apple.com/en-mn/guide/deployment/depdca572563/1/web/1.0)

## Quit and reopen the GlobalProtect menu-bar app

Run these commands from Terminal in your graphical session. `$(id -u)` supplies your numeric user ID, so `gui/$(id -u)` selects your desktop login session. `bootout` stops and unloads the specified job. `bootstrap` registers it again. An installed agent can load again when you sign in.

**Quit the menu-bar app**

```sh
launchctl bootout "gui/$(id -u)" /Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist
```

**Reopen the menu-bar app**

```sh
launchctl bootstrap "gui/$(id -u)" /Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist
```

**Check whether the job is loaded**

```sh
launchctl print "gui/$(id -u)/com.paloaltonetworks.gp.pangpa"
```

`state = running` means the job is running. A service-not-found message means the job is absent from that session.

Palo Alto Networks also documents the older `unload` and `load` commands for this agent. If you use this pair, run the first line to quit and the second when you want to reopen it. Your Mac’s `man launchctl` describes both command pairs. [Palo Alto Networks’ stop and start instructions](https://knowledgebase.paloaltonetworks.com/kCSArticleDetail?id=kA10g0000008UGs)

```sh
launchctl unload /Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist
launchctl load /Library/LaunchAgents/com.paloaltonetworks.gp.pangpa.plist
```

**To end the VPN connection**, use **Disconnect** in the GlobalProtect menu when available. A separate service manages the VPN, so the tunnel can stay active after the menu-bar app closes. Your organization’s configuration controls when you can disconnect. If you want to see what endpoint details your client reports, check **GlobalProtect → Settings → Host Profile**, when available. [GlobalProtect disconnect instructions](https://docs.paloaltonetworks.com/globalprotect/user-guide/6-3/globalprotect-app-for-mac/disable-the-globalprotect-app-for-mac) · [GlobalProtect macOS user guide](https://docs.paloaltonetworks.com/globalprotect/user-guide/6-3/globalprotect-app-for-mac/use-the-globalprotect-app-for-mac)

## Open DingTalk at sign-in with a LaunchAgent

Adding DingTalk under **Open at Login** tells macOS to open the app at sign-in. macOS stores that entry in your account’s login-item registry, which explains why looking for it in the LaunchAgents folders comes up empty. To inspect the login-item record, run `sfltool dumpbtm | grep -i -C 6 dingtalk`. [Apple’s login items guide](https://support.apple.com/en-mt/guide/mac-help/mh15189/27/mac/27)

If you want a LaunchAgent you can inspect with `launchctl`, create this file in your account’s LaunchAgents folder. The label is a name you choose for the job. `open -b` uses DingTalk’s bundle ID to open the app.

```sh
mkdir -p "$HOME/Library/LaunchAgents"
ding_agent="$HOME/Library/LaunchAgents/local.dingtalk.open-at-login.plist"

cat > "$ding_agent" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>local.dingtalk.open-at-login</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>-b</string>
    <string>com.alibaba.DingTalkMac</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
PLIST

chmod 600 "$ding_agent"
plutil -lint "$ding_agent"
```

Run `bootstrap` to load the job now and `print` to inspect it by label.

```sh
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/local.dingtalk.open-at-login.plist"
launchctl print "gui/$(id -u)/local.dingtalk.open-at-login"
```

The agent runs `open` once when loaded, so the job can be idle while DingTalk is open. Use **Command–Q** to quit DingTalk. If you switch to this LaunchAgent, remove DingTalk’s existing **Open at Login** entry so you have one startup entry.

To undo the example, use `bootout` with the same `.plist` path, then move the file to the Trash so it won’t load at your next sign-in.
