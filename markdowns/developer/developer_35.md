# Xcode Pre-actions for launching multi simulators simultaneously

## Environment
macOS 15.4.1
Xcode 16.4, Xcode 27

## Note
Tested on Xcode 27, 9 Oct 2026. A Run pre-action cannot show the app on both an iPhone and an iPad simulator in one build. Device Hub keeps one window for the destination selected in the scheme. `simctl` can still install and launch on the other simulator, but that device has no Device Hub screen, reports a zero screen size, and the app aborts there. If the run destination is an iPhone, the iPad crashes. If the destination is an iPad, the iPhone crashes. One `Debug-iphonesimulator` app is already the package for both families; building again for the other destination does not change this. `run_simulators.sh` is the Xcode 27 attempt and does not work for this yet. `run_simulators_xcode26.sh` is for Xcode 26 and earlier, where Simulator.app still opens both screens.

## Steps
1. Chmod the script for the Xcode you are using:
`chmod +x run_simulators.sh`
`chmod +x run_simulators_xcode26.sh`

2. Product -> Scheme -> Edit Scheme...

3. In the left column, click the disclosure triangle beside **Run**, then select **Pre-actions**. The targets table on the Build page does not list it. Click **+** -> **New Run Script Action**, set **Provide build settings from** to your app target, and set the script to one path:
```
# Xcode 27, which opens simulators in Device Hub
/Users/gavinxiang/Downloads/Shell-Collection/xcode-run-multi-simulators/run_simulators.sh

# Xcode 26 and earlier, which still ship Simulator.app
/Users/gavinxiang/Downloads/Shell-Collection/xcode-run-multi-simulators/run_simulators_xcode26.sh
```

4. Build the project, then Run with any simulator destination. The run pre-action installs the same simulator app on one iPhone and one iPad and opens that device's screen before launch. On Xcode 27 that screen is Device Hub. On Xcode 26 and earlier it is Simulator.app. You can debug only in the simulator selected in the scheme.

`create_simulators.sh` is not a scheme pre-action. Run it yourself only when you want a simulator named `Custom Simulators` on the latest plain iPhone. The run script does not look that device up.

## simulator_preaction.log
```
% cat /tmp/simulator_preaction.log

Starting multi-platform script at Thu May 29 16:43:05 CST 2025
Initial APP_NAME: XXX.app
App path: /Users/gavinxiang/Library/Developer/Xcode/DerivedData/Synergy-bkxggwbcicgmmqfogvylakullldw/Build/Products/Debug-iphonesimulator/XXX.app
Bundle ID: com.xxx.xxx
UIDeviceFamily: [1,2]
Minimum OS: 18.0
Supports iPhone: 1, iPad: 1
Booted iPhone: iPhone 16 Pro (DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD)
Booted iPhone: iPhone 16 (CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC)
No booted iPad; falling back to first iPad: iPad Pro 13-inch (M4) (EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE)
Processing iPhone 16 Pro (DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD)...
iPhone 16 Pro is already booted
Uninstalling existing app on iPhone 16 Pro...
Installing on iPhone 16 Pro...
Launching on iPhone 16 Pro...
Processing iPhone 16 (CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC)...
iPhone 16 is already booted
Uninstalling existing app on iPhone 16...
Installing on iPhone 16...
Launching on iPhone 16...
Processing iPad Pro 13-inch (M4) (EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE)...
Booting iPad Pro 13-inch (M4)...
Uninstalling existing app on iPad Pro 13-inch (M4)...
Installing on iPad Pro 13-inch (M4)...
Launching on iPad Pro 13-inch (M4)...
Multi-platform script completed at Thu May 29 16:44:12 CST 2025
```

## Scripts
`create_simulators.sh`

```
#!/bin/bash

# Create a simulator named "Custom Simulators" on the latest iOS runtime
# when it does not already exist. The device type is the newest plain iPhone
# (iPhone 17, iPhone 18, ...), not a hardcoded model.

custom_sim=$(xcrun simctl list devices | grep 'Custom Simulators' | awk -F'[()]' '{print $2}')

if [ -z "${custom_sim}" ]; then
  latest_ios_runtime=$(xcrun simctl list runtimes | grep iOS | grep -v unavailable | tail -1 | awk '{print $NF}')
  latest_iphone_type=$(xcrun simctl list devicetypes | sed -n 's/.*(\(com\.apple\.CoreSimulator\.SimDeviceType\.iPhone-[0-9][0-9]*\)).*/\1/p' | awk -F- '{ print $NF "\t" $0 }' | sort -n | tail -1 | cut -f2-)

  if [ -z "$latest_iphone_type" ] || [ -z "$latest_ios_runtime" ]; then
    echo "Could not resolve an iPhone device type or iOS runtime" >&2
    exit 1
  fi

  xcrun simctl create "Custom Simulators" "$latest_iphone_type" "$latest_ios_runtime"
fi
```

`run_simulators.sh` for Xcode 27

Installs the built simulator app on one iPhone and one iPad. Each device is opened in Device Hub before launch so the other platform has a real screen. Support comes from `UIDeviceFamily` (iPhone = 1, iPad = 2) and the app minimum OS.

```
#!/bin/bash
# Xcode Run pre-action: install and launch the built app on simulators.
#
# Selection:
#   One simulator .app is installed on both families. For each family, launch
#   on an already-booted simulator first. If that process exits immediately,
#   try the next simulator of the same family on the latest iOS runtime.
# Xcode 27 shows devices in Device Hub instead of Simulator.app. A device
# launched with no Device Hub window has a zero screen size and the app aborts,
# which is why the non-destination platform crashes.
#
# After a run, inspect the log with:
#   cat /tmp/simulator_preaction.log

LOG_FILE="/tmp/simulator_preaction.log"
echo "Starting multi-platform script at $(date)" > "$LOG_FILE"

APP_NAME=$(xcrun xcodebuild -showBuildSettings -project "${PROJECT_FILE_PATH}" -target "${TARGET_NAME}" | grep "FULL_PRODUCT_NAME" | sed 's/.*= \(.*\)/\1/' | head -1)
echo "Initial APP_NAME: $APP_NAME" >> "$LOG_FILE"

if [ -z "$APP_NAME" ]; then
    APP_NAME="${TARGET_NAME}.app"
    echo "Using fallback APP_NAME: $APP_NAME" >> "$LOG_FILE"
fi

APP_PATH="${BUILT_PRODUCTS_DIR}/${APP_NAME}"
echo "App path: $APP_PATH" >> "$LOG_FILE"

BUNDLE_ID=$(defaults read "$APP_PATH/Info" CFBundleIdentifier 2>/dev/null)
echo "Bundle ID: $BUNDLE_ID" >> "$LOG_FILE"

if [ -z "$BUNDLE_ID" ]; then
    echo "Could not read bundle ID from $APP_PATH; aborting" >> "$LOG_FILE"
    echo "Multi-platform script completed at $(date)" >> "$LOG_FILE"
    exit 0
fi

UDID_RE='[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}'

supports_iphone=0
supports_ipad=0
family_json=$(plutil -extract UIDeviceFamily json -o - "$APP_PATH/Info.plist" 2>/dev/null || true)
echo "UIDeviceFamily: ${family_json:-<missing>}" >> "$LOG_FILE"

if [ -n "$family_json" ]; then
    printf '%s\n' "$family_json" | grep -Eq '(^|[^0-9])1([^0-9]|$)' && supports_iphone=1
    printf '%s\n' "$family_json" | grep -Eq '(^|[^0-9])2([^0-9]|$)' && supports_ipad=1
elif [ -n "${TARGETED_DEVICE_FAMILY:-}" ]; then
    echo "Using TARGETED_DEVICE_FAMILY: $TARGETED_DEVICE_FAMILY" >> "$LOG_FILE"
    printf '%s\n' "$TARGETED_DEVICE_FAMILY" | grep -Eq '(^|[^0-9])1([^0-9]|$)' && supports_iphone=1
    printf '%s\n' "$TARGETED_DEVICE_FAMILY" | grep -Eq '(^|[^0-9])2([^0-9]|$)' && supports_ipad=1
else
    echo "Device family unknown; assuming iPhone and iPad" >> "$LOG_FILE"
    supports_iphone=1
    supports_ipad=1
fi

min_os=$(plutil -extract MinimumOSVersion raw -o - "$APP_PATH/Info.plist" 2>/dev/null || true)
if [ -z "$min_os" ]; then
    min_os="${IPHONEOS_DEPLOYMENT_TARGET:-}"
fi
echo "Minimum OS: ${min_os:-<none>}" >> "$LOG_FILE"
echo "Supports iPhone: $supports_iphone, iPad: $supports_ipad" >> "$LOG_FILE"

# $1 >= $2, compared as major.minor
version_gt() {
    version_ge "$1" "$2" && [ "$1" != "$2" ]
}

version_ge() {
    local a_major a_minor b_major b_minor
    a_major=${1%%.*}
    a_minor=${1#*.}
    a_minor=${a_minor%%.*}
    b_major=${2%%.*}
    b_minor=${2#*.}
    b_minor=${b_minor%%.*}
    a_major=${a_major:-0}
    a_minor=${a_minor:-0}
    b_major=${b_major:-0}
    b_minor=${b_minor:-0}
    if [ "$a_major" -gt "$b_major" ]; then
        return 0
    fi
    if [ "$a_major" -lt "$b_major" ]; then
        return 1
    fi
    [ "$a_minor" -ge "$b_minor" ]
}

booted_names=()
booted_udids=()
booted_kinds=()
booted_runtimes=()
dev_names=()
dev_udids=()
dev_kinds=()
dev_runtimes=()
first_iphone_name=""
first_iphone_udid=""
first_iphone_runtime=""
first_ipad_name=""
first_ipad_udid=""
first_ipad_runtime=""
current_runtime=""

note_first_on_latest_runtime() {
    local runtime=$1
    local kind=$2
    local name=$3
    local udid=$4

    if [ "$kind" = "iphone" ]; then
        if [ -z "$first_iphone_runtime" ] || version_gt "$runtime" "$first_iphone_runtime"; then
            first_iphone_runtime=$runtime
            first_iphone_name=$name
            first_iphone_udid=$udid
        fi
    elif [ "$kind" = "ipad" ]; then
        if [ -z "$first_ipad_runtime" ] || version_gt "$runtime" "$first_ipad_runtime"; then
            first_ipad_runtime=$runtime
            first_ipad_name=$name
            first_ipad_udid=$udid
        fi
    fi
}

while IFS= read -r line; do
    if [[ "$line" =~ --[[:space:]]+iOS[[:space:]]+([0-9]+(\.[0-9]+)*)[[:space:]]+-- ]]; then
        current_runtime="${BASH_REMATCH[1]}"
        continue
    fi
    if [[ "$line" =~ --[[:space:]]+.+[[:space:]]+-- ]]; then
        current_runtime=""
        continue
    fi
    [ -z "$current_runtime" ] && continue
    if [ -n "$min_os" ] && ! version_ge "$current_runtime" "$min_os"; then
        continue
    fi

    [[ "$line" =~ $UDID_RE ]] || continue
    udid=$(printf '%s\n' "$line" | grep -o -E "$UDID_RE" | head -1)
    name=$(printf '%s\n' "$line" | sed -E "s/^[[:space:]]*//; s/ \\(${UDID_RE}\\).*//")

    kind=""
    if [[ "$name" == *"iPad"* ]]; then
        kind="ipad"
    elif [[ "$name" == *"iPhone"* ]]; then
        kind="iphone"
    else
        continue
    fi

    note_first_on_latest_runtime "$current_runtime" "$kind" "$name" "$udid"
    dev_names+=("$name")
    dev_udids+=("$udid")
    dev_kinds+=("$kind")
    dev_runtimes+=("$current_runtime")

    if [[ "$line" == *"(Booted)"* ]]; then
        booted_names+=("$name")
        booted_udids+=("$udid")
        booted_kinds+=("$kind")
        booted_runtimes+=("$current_runtime")
    fi
done < <(xcrun simctl list devices available 2>/dev/null)

try_names_iphone=()
try_udids_iphone=()
try_names_ipad=()
try_udids_ipad=()

append_try() {
    local family=$1
    local name=$2
    local udid=$3
    local i
    if [ "$family" = "iphone" ]; then
        for ((i = 0; i < ${#try_udids_iphone[@]}; i++)); do
            [ "${try_udids_iphone[$i]}" = "$udid" ] && return
        done
        try_names_iphone+=("$name")
        try_udids_iphone+=("$udid")
    else
        for ((i = 0; i < ${#try_udids_ipad[@]}; i++)); do
            [ "${try_udids_ipad[$i]}" = "$udid" ] && return
        done
        try_names_ipad+=("$name")
        try_udids_ipad+=("$udid")
    fi
}

for ((i = 0; i < ${#booted_udids[@]}; i++)); do
    if [ "${booted_kinds[$i]}" = "iphone" ] && [ "$supports_iphone" -eq 1 ]; then
        echo "Booted iPhone: ${booted_names[$i]} (${booted_udids[$i]}) iOS ${booted_runtimes[$i]}" >> "$LOG_FILE"
        append_try iphone "${booted_names[$i]}" "${booted_udids[$i]}"
    elif [ "${booted_kinds[$i]}" = "ipad" ] && [ "$supports_ipad" -eq 1 ]; then
        echo "Booted iPad: ${booted_names[$i]} (${booted_udids[$i]}) iOS ${booted_runtimes[$i]}" >> "$LOG_FILE"
        append_try ipad "${booted_names[$i]}" "${booted_udids[$i]}"
    fi
done

for ((i = 0; i < ${#dev_udids[@]}; i++)); do
    if [ "${dev_kinds[$i]}" = "iphone" ] && [ "$supports_iphone" -eq 1 ] && [ "${dev_runtimes[$i]}" = "$first_iphone_runtime" ]; then
        append_try iphone "${dev_names[$i]}" "${dev_udids[$i]}"
    elif [ "${dev_kinds[$i]}" = "ipad" ] && [ "$supports_ipad" -eq 1 ] && [ "${dev_runtimes[$i]}" = "$first_ipad_runtime" ]; then
        append_try ipad "${dev_names[$i]}" "${dev_udids[$i]}"
    fi
done

if [ "$supports_iphone" -eq 0 ]; then
    echo "App does not support iPhone; skipping iPhone simulators" >> "$LOG_FILE"
fi
if [ "$supports_ipad" -eq 0 ]; then
    echo "App does not support iPad; skipping iPad simulators" >> "$LOG_FILE"
fi

ensure_booted() {
    local device_name=$1
    local udid=$2
    local status
    status=$(xcrun simctl list devices | grep "$udid" | grep -o "(Booted)" || echo "(Not Booted)")

    if [[ "$status" == "(Booted)" ]]; then
        echo "$device_name is already booted" >> "$LOG_FILE"
    else
        echo "Booting $device_name..." >> "$LOG_FILE"
        xcrun simctl boot "$udid" >> "$LOG_FILE" 2>&1
        xcrun simctl bootstatus "$udid" -b >> "$LOG_FILE" 2>&1 || true
    fi
}

show_simulator() {
    local udid=$1
    local developer_dir hub simulator_app
    developer_dir="$(xcode-select -p)"
    hub="$(cd "$developer_dir/../Applications" 2>/dev/null && pwd)/DeviceHub.app"
    if [ -d "$hub" ]; then
        echo "Opening Device Hub for $udid" >> "$LOG_FILE"
        open -a "$hub" --args -CurrentDeviceUDID "$udid" >> "$LOG_FILE" 2>&1 || true
        open "devices://$udid" >> "$LOG_FILE" 2>&1 || true
        return
    fi
    simulator_app="$developer_dir/Applications/Simulator.app"
    if [ ! -d "$simulator_app" ]; then
        simulator_app="Simulator"
    fi
    echo "Opening Simulator window for $udid" >> "$LOG_FILE"
    open -a "$simulator_app" --args -CurrentDeviceUDID "$udid" >> "$LOG_FILE" 2>&1 || true
}

process_device() {
    local device_name=$1
    local udid=$2

    if [ -n "$udid" ]; then
        echo "Processing $device_name ($udid)..." >> "$LOG_FILE"
        ensure_booted "$device_name" "$udid"
        show_simulator "$udid"
        sleep 1

        echo "Uninstalling existing app on $device_name..." >> "$LOG_FILE"
        xcrun simctl uninstall "$udid" "$BUNDLE_ID" >> "$LOG_FILE" 2>&1 || true

        echo "Installing on $device_name..." >> "$LOG_FILE"
        xcrun simctl install "$udid" "$APP_PATH" >> "$LOG_FILE" 2>&1

        echo "Launching on $device_name..." >> "$LOG_FILE"
        xcrun simctl launch "$udid" "$BUNDLE_ID" >> "$LOG_FILE" 2>&1
        sleep 4
        if xcrun simctl spawn "$udid" launchctl list 2>/dev/null | grep -q "$BUNDLE_ID"; then
            return 0
        fi
        return 1
    else
        echo "No simulator found for $device_name" >> "$LOG_FILE"
        return 1
    fi
}

launch_family() {
    local family=$1
    local names=()
    local udids=()
    local i attempts=0
    if [ "$family" = "iphone" ]; then
        names=("${try_names_iphone[@]}")
        udids=("${try_udids_iphone[@]}")
    else
        names=("${try_names_ipad[@]}")
        udids=("${try_udids_ipad[@]}")
    fi
    if [ ${#udids[@]} -eq 0 ]; then
        echo "No $family simulator to launch" >> "$LOG_FILE"
        return
    fi
    for ((i = 0; i < ${#udids[@]}; i++)); do
        attempts=$((attempts + 1))
        if [ "$attempts" -gt 4 ]; then
            echo "Stopped after 4 $family launch attempts" >> "$LOG_FILE"
            return
        fi
        if process_device "${names[$i]}" "${udids[$i]}"; then
            echo "App is running on ${names[$i]}" >> "$LOG_FILE"
            return
        fi
        echo "App exited on ${names[$i]}; trying another $family" >> "$LOG_FILE"
    done
}

if [ "$supports_iphone" -eq 1 ]; then
    launch_family iphone
fi
if [ "$supports_ipad" -eq 1 ]; then
    launch_family ipad
fi

echo "Multi-platform script completed at $(date)" >> "$LOG_FILE"
exit 0
```

`run_simulators_xcode26.sh` for Xcode 26 and earlier

Same launch behavior as `run_simulators.sh`, but it opens Simulator.app instead of Device Hub.

```
#!/bin/bash
# Xcode 26 and earlier Run pre-action. Use run_simulators.sh on Xcode 27.
#
# Selection:
#   One simulator .app is installed on both families. For each family, launch
#   on an already-booted simulator first. If that process exits immediately,
#   try the next simulator of the same family on the latest iOS runtime.
# This Xcode still ships Simulator.app. Open that window before launch so the
# other platform has a real screen size.
#
# After a run, inspect the log with:
#   cat /tmp/simulator_preaction.log

LOG_FILE="/tmp/simulator_preaction.log"
echo "Starting multi-platform script at $(date)" > "$LOG_FILE"

APP_NAME=$(xcrun xcodebuild -showBuildSettings -project "${PROJECT_FILE_PATH}" -target "${TARGET_NAME}" | grep "FULL_PRODUCT_NAME" | sed 's/.*= \(.*\)/\1/' | head -1)
echo "Initial APP_NAME: $APP_NAME" >> "$LOG_FILE"

if [ -z "$APP_NAME" ]; then
    APP_NAME="${TARGET_NAME}.app"
    echo "Using fallback APP_NAME: $APP_NAME" >> "$LOG_FILE"
fi

APP_PATH="${BUILT_PRODUCTS_DIR}/${APP_NAME}"
echo "App path: $APP_PATH" >> "$LOG_FILE"

BUNDLE_ID=$(defaults read "$APP_PATH/Info" CFBundleIdentifier 2>/dev/null)
echo "Bundle ID: $BUNDLE_ID" >> "$LOG_FILE"

if [ -z "$BUNDLE_ID" ]; then
    echo "Could not read bundle ID from $APP_PATH; aborting" >> "$LOG_FILE"
    echo "Multi-platform script completed at $(date)" >> "$LOG_FILE"
    exit 0
fi

UDID_RE='[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}'

supports_iphone=0
supports_ipad=0
family_json=$(plutil -extract UIDeviceFamily json -o - "$APP_PATH/Info.plist" 2>/dev/null || true)
echo "UIDeviceFamily: ${family_json:-<missing>}" >> "$LOG_FILE"

if [ -n "$family_json" ]; then
    printf '%s\n' "$family_json" | grep -Eq '(^|[^0-9])1([^0-9]|$)' && supports_iphone=1
    printf '%s\n' "$family_json" | grep -Eq '(^|[^0-9])2([^0-9]|$)' && supports_ipad=1
elif [ -n "${TARGETED_DEVICE_FAMILY:-}" ]; then
    echo "Using TARGETED_DEVICE_FAMILY: $TARGETED_DEVICE_FAMILY" >> "$LOG_FILE"
    printf '%s\n' "$TARGETED_DEVICE_FAMILY" | grep -Eq '(^|[^0-9])1([^0-9]|$)' && supports_iphone=1
    printf '%s\n' "$TARGETED_DEVICE_FAMILY" | grep -Eq '(^|[^0-9])2([^0-9]|$)' && supports_ipad=1
else
    echo "Device family unknown; assuming iPhone and iPad" >> "$LOG_FILE"
    supports_iphone=1
    supports_ipad=1
fi

min_os=$(plutil -extract MinimumOSVersion raw -o - "$APP_PATH/Info.plist" 2>/dev/null || true)
if [ -z "$min_os" ]; then
    min_os="${IPHONEOS_DEPLOYMENT_TARGET:-}"
fi
echo "Minimum OS: ${min_os:-<none>}" >> "$LOG_FILE"
echo "Supports iPhone: $supports_iphone, iPad: $supports_ipad" >> "$LOG_FILE"

# $1 >= $2, compared as major.minor
version_gt() {
    version_ge "$1" "$2" && [ "$1" != "$2" ]
}

version_ge() {
    local a_major a_minor b_major b_minor
    a_major=${1%%.*}
    a_minor=${1#*.}
    a_minor=${a_minor%%.*}
    b_major=${2%%.*}
    b_minor=${2#*.}
    b_minor=${b_minor%%.*}
    a_major=${a_major:-0}
    a_minor=${a_minor:-0}
    b_major=${b_major:-0}
    b_minor=${b_minor:-0}
    if [ "$a_major" -gt "$b_major" ]; then
        return 0
    fi
    if [ "$a_major" -lt "$b_major" ]; then
        return 1
    fi
    [ "$a_minor" -ge "$b_minor" ]
}

booted_names=()
booted_udids=()
booted_kinds=()
booted_runtimes=()
dev_names=()
dev_udids=()
dev_kinds=()
dev_runtimes=()
first_iphone_name=""
first_iphone_udid=""
first_iphone_runtime=""
first_ipad_name=""
first_ipad_udid=""
first_ipad_runtime=""
current_runtime=""

note_first_on_latest_runtime() {
    local runtime=$1
    local kind=$2
    local name=$3
    local udid=$4

    if [ "$kind" = "iphone" ]; then
        if [ -z "$first_iphone_runtime" ] || version_gt "$runtime" "$first_iphone_runtime"; then
            first_iphone_runtime=$runtime
            first_iphone_name=$name
            first_iphone_udid=$udid
        fi
    elif [ "$kind" = "ipad" ]; then
        if [ -z "$first_ipad_runtime" ] || version_gt "$runtime" "$first_ipad_runtime"; then
            first_ipad_runtime=$runtime
            first_ipad_name=$name
            first_ipad_udid=$udid
        fi
    fi
}

while IFS= read -r line; do
    if [[ "$line" =~ --[[:space:]]+iOS[[:space:]]+([0-9]+(\.[0-9]+)*)[[:space:]]+-- ]]; then
        current_runtime="${BASH_REMATCH[1]}"
        continue
    fi
    if [[ "$line" =~ --[[:space:]]+.+[[:space:]]+-- ]]; then
        current_runtime=""
        continue
    fi
    [ -z "$current_runtime" ] && continue
    if [ -n "$min_os" ] && ! version_ge "$current_runtime" "$min_os"; then
        continue
    fi

    [[ "$line" =~ $UDID_RE ]] || continue
    udid=$(printf '%s\n' "$line" | grep -o -E "$UDID_RE" | head -1)
    name=$(printf '%s\n' "$line" | sed -E "s/^[[:space:]]*//; s/ \\(${UDID_RE}\\).*//")

    kind=""
    if [[ "$name" == *"iPad"* ]]; then
        kind="ipad"
    elif [[ "$name" == *"iPhone"* ]]; then
        kind="iphone"
    else
        continue
    fi

    note_first_on_latest_runtime "$current_runtime" "$kind" "$name" "$udid"
    dev_names+=("$name")
    dev_udids+=("$udid")
    dev_kinds+=("$kind")
    dev_runtimes+=("$current_runtime")

    if [[ "$line" == *"(Booted)"* ]]; then
        booted_names+=("$name")
        booted_udids+=("$udid")
        booted_kinds+=("$kind")
        booted_runtimes+=("$current_runtime")
    fi
done < <(xcrun simctl list devices available 2>/dev/null)

try_names_iphone=()
try_udids_iphone=()
try_names_ipad=()
try_udids_ipad=()

append_try() {
    local family=$1
    local name=$2
    local udid=$3
    local i
    if [ "$family" = "iphone" ]; then
        for ((i = 0; i < ${#try_udids_iphone[@]}; i++)); do
            [ "${try_udids_iphone[$i]}" = "$udid" ] && return
        done
        try_names_iphone+=("$name")
        try_udids_iphone+=("$udid")
    else
        for ((i = 0; i < ${#try_udids_ipad[@]}; i++)); do
            [ "${try_udids_ipad[$i]}" = "$udid" ] && return
        done
        try_names_ipad+=("$name")
        try_udids_ipad+=("$udid")
    fi
}

for ((i = 0; i < ${#booted_udids[@]}; i++)); do
    if [ "${booted_kinds[$i]}" = "iphone" ] && [ "$supports_iphone" -eq 1 ]; then
        echo "Booted iPhone: ${booted_names[$i]} (${booted_udids[$i]}) iOS ${booted_runtimes[$i]}" >> "$LOG_FILE"
        append_try iphone "${booted_names[$i]}" "${booted_udids[$i]}"
    elif [ "${booted_kinds[$i]}" = "ipad" ] && [ "$supports_ipad" -eq 1 ]; then
        echo "Booted iPad: ${booted_names[$i]} (${booted_udids[$i]}) iOS ${booted_runtimes[$i]}" >> "$LOG_FILE"
        append_try ipad "${booted_names[$i]}" "${booted_udids[$i]}"
    fi
done

for ((i = 0; i < ${#dev_udids[@]}; i++)); do
    if [ "${dev_kinds[$i]}" = "iphone" ] && [ "$supports_iphone" -eq 1 ] && [ "${dev_runtimes[$i]}" = "$first_iphone_runtime" ]; then
        append_try iphone "${dev_names[$i]}" "${dev_udids[$i]}"
    elif [ "${dev_kinds[$i]}" = "ipad" ] && [ "$supports_ipad" -eq 1 ] && [ "${dev_runtimes[$i]}" = "$first_ipad_runtime" ]; then
        append_try ipad "${dev_names[$i]}" "${dev_udids[$i]}"
    fi
done

if [ "$supports_iphone" -eq 0 ]; then
    echo "App does not support iPhone; skipping iPhone simulators" >> "$LOG_FILE"
fi
if [ "$supports_ipad" -eq 0 ]; then
    echo "App does not support iPad; skipping iPad simulators" >> "$LOG_FILE"
fi

ensure_booted() {
    local device_name=$1
    local udid=$2
    local status
    status=$(xcrun simctl list devices | grep "$udid" | grep -o "(Booted)" || echo "(Not Booted)")

    if [[ "$status" == "(Booted)" ]]; then
        echo "$device_name is already booted" >> "$LOG_FILE"
    else
        echo "Booting $device_name..." >> "$LOG_FILE"
        xcrun simctl boot "$udid" >> "$LOG_FILE" 2>&1
        xcrun simctl bootstatus "$udid" -b >> "$LOG_FILE" 2>&1 || true
    fi
}

show_simulator() {
    local udid=$1
    local simulator_app
    simulator_app="$(xcode-select -p)/Applications/Simulator.app"
    if [ ! -d "$simulator_app" ]; then
        simulator_app="Simulator"
    fi
    echo "Opening Simulator window for $udid" >> "$LOG_FILE"
    open -a "$simulator_app" --args -CurrentDeviceUDID "$udid" >> "$LOG_FILE" 2>&1 || true
}

process_device() {
    local device_name=$1
    local udid=$2

    if [ -n "$udid" ]; then
        echo "Processing $device_name ($udid)..." >> "$LOG_FILE"
        ensure_booted "$device_name" "$udid"
        show_simulator "$udid"
        sleep 1

        echo "Uninstalling existing app on $device_name..." >> "$LOG_FILE"
        xcrun simctl uninstall "$udid" "$BUNDLE_ID" >> "$LOG_FILE" 2>&1 || true

        echo "Installing on $device_name..." >> "$LOG_FILE"
        xcrun simctl install "$udid" "$APP_PATH" >> "$LOG_FILE" 2>&1

        echo "Launching on $device_name..." >> "$LOG_FILE"
        xcrun simctl launch "$udid" "$BUNDLE_ID" >> "$LOG_FILE" 2>&1
        sleep 4
        if xcrun simctl spawn "$udid" launchctl list 2>/dev/null | grep -q "$BUNDLE_ID"; then
            return 0
        fi
        return 1
    else
        echo "No simulator found for $device_name" >> "$LOG_FILE"
        return 1
    fi
}

launch_family() {
    local family=$1
    local names=()
    local udids=()
    local i attempts=0
    if [ "$family" = "iphone" ]; then
        names=("${try_names_iphone[@]}")
        udids=("${try_udids_iphone[@]}")
    else
        names=("${try_names_ipad[@]}")
        udids=("${try_udids_ipad[@]}")
    fi
    if [ ${#udids[@]} -eq 0 ]; then
        echo "No $family simulator to launch" >> "$LOG_FILE"
        return
    fi
    for ((i = 0; i < ${#udids[@]}; i++)); do
        attempts=$((attempts + 1))
        if [ "$attempts" -gt 4 ]; then
            echo "Stopped after 4 $family launch attempts" >> "$LOG_FILE"
            return
        fi
        if process_device "${names[$i]}" "${udids[$i]}"; then
            echo "App is running on ${names[$i]}" >> "$LOG_FILE"
            return
        fi
        echo "App exited on ${names[$i]}; trying another $family" >> "$LOG_FILE"
    done
}

if [ "$supports_iphone" -eq 1 ]; then
    launch_family iphone
fi
if [ "$supports_ipad" -eq 1 ]; then
    launch_family ipad
fi

echo "Multi-platform script completed at $(date)" >> "$LOG_FILE"
exit 0
```
