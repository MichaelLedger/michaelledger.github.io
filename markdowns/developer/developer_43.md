# Restore internet after closing Charles

Charles can leave macOS HTTP and HTTPS proxies enabled at `127.0.0.1:8888`. After Charles closes, Safari may still try to use that unavailable proxy.

## Run the repair

1. Quit Charles.
2. Copy the entire shell code block below and paste it into Terminal.
3. Enter your Mac administrator password when prompted. Password characters are not displayed.
4. Reload Safari with **Command-R** and open <https://www.google.com>.

The script checks every network service and disables only enabled HTTP/HTTPS proxies pointing to `127.0.0.1`, `localhost`, or `::1` on port `8888`. Other proxy settings and saved addresses are preserved. Running it again is safe.

## Repair script

```sh
sudo /bin/bash <<'CHARLES_PROXY_REPAIR'

changed=0
failed=0
services=$(/usr/sbin/networksetup -listallnetworkservices)
while IFS= read -r service; do
  [ -n "$service" ] || continue
  # Disabled services have a leading asterisk in networksetup's listing.
  service="${service#\*}"
  for kind in web secureweb; do
    if ! settings=$(/usr/sbin/networksetup "-get${kind}proxy" "$service"); then
      echo "Could not inspect $service ($kind)."
      failed=1
      continue
    fi
    if printf '%s\n' "$settings" | /usr/bin/awk '
      /^Enabled: Yes$/ { enabled=1 }
      /^Server: (127\.0\.0\.1|localhost|::1)$/ { localproxy=1 }
      /^Port: 8888$/ { charlesport=1 }
      END { exit !(enabled && localproxy && charlesport) }
    '; then
      if /usr/sbin/networksetup "-set${kind}proxystate" "$service" off; then
        echo "Disabled Charles $kind proxy on: $service"
        changed=$((changed + 1))
      else
        echo "Failed to disable $kind proxy on: $service"
        failed=1
      fi
    fi
  done
done <<< "$(printf '%s\n' "$services" | /usr/bin/sed '1d')"

echo
echo "Disabled $changed Charles proxy setting(s)."
echo "Current system proxy settings:"
/usr/sbin/scutil --proxy
echo
echo "Reload Safari (Command-R), then try https://www.google.com."
echo "This script only disables enabled HTTP/HTTPS loopback proxies on port 8888."
exit "$failed"
CHARLES_PROXY_REPAIR
```

## Check the result

```sh
scutil --proxy
curl --noproxy '*' -I --connect-timeout 10 --max-time 20 https://www.google.com
```

After repair, the effective `HTTPEnable` and `HTTPSEnable` entries should be `0` or absent. An HTTP response from curl confirms direct HTTPS connectivity; reload Safari to verify the browser itself.

## Avoid a repeat

In Charles, turn off **Proxy → macOS Proxy** before quitting. If the problem returns, rerun the repair. To capture traffic again, open Charles and re-enable its macOS proxy.

If your account cannot use sudo, run the repair using a Mac administrator account. This repair does not remove certificates or change DNS, VPN, or Wi-Fi settings.
