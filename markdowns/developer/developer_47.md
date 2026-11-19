# Mac storage audit

**November 19, 2026 · Read-only audit**

The startup APFS container was **96% full**, with **954.6 GB used out of 994.7 GB** and **40.1 GB free**. The screenshot showed **367.37 GB of System Data**. The Data volume consumed **920.7 GB**, and a direct APFS check found **zero snapshots on that volume**. No existing files were moved or deleted.

Xcode and simulator data were the largest storage pools I measured. The file scan found about **914.8 GB** on the Data volume. Protected paths limited coverage, and macOS does not expose a folder-level breakdown of the System Data label. Sizes below are decimal GB. APFS shared blocks can make the space reclaimed smaller than the measured folder size. [Apple’s Storage settings guide](https://support.apple.com/guide/mac-help/change-storage-settings-mchl3d437fbc/mac)

## Rebuildable files to review first

| Measured size | Location | What to review |
|---:|---|---|
| **109.2 GB** | `~/Library/Developer/Xcode/DerivedData` | Review inactive project build folders after quitting Xcode. FullBellyIntl has two folders measuring **25.4 GB** and **19.5 GB**. Wrenda has two measuring **19.8 GB** and **9.1 GB**. Preserve any package checkout with local edits. Xcode rebuilds indexes and products as needed. |
| **31.0 GB** | Five specific build and log directories under `/private/tmp` | Review the exact folders below once their builds and Codex jobs have finished. Preserve any logs you want to keep. |
| **10.9 GB** | `~/Library/Caches/org.swift.swiftpm` | SwiftPM repository and artifact caches. Review after builds finish. Future builds may download dependencies again. |
| **10.0 GB** | `~/.cache/huggingface/xet` | Almost all measured space was in the download chunk cache. Review after model transfers finish. The adjacent Hub cache holds another **3.6 GB** of downloaded models and datasets, which may be needed for offline work. [Hugging Face cache documentation](https://huggingface.co/docs/huggingface_hub/en/guides/manage-cache) |
| **8.3 GB** | `.build` directories in `~/Downloads/PRTBusinessUnit`, `~/Downloads/common_ios_prt_select_photo`, and `~/Downloads/fp_ios_address` | Generated Swift package build output. Review after the corresponding builds finish. |
| **4.3 GB** | `~/Library/Developer/Xcode/DocumentationCache` | Local Xcode documentation cache. |
| **3.0 GB** | `~/Library/Caches/vscode-cpptools` | VS Code C/C++ indexes, which can regenerate when the editor reopens the projects. |

### Detailed `/private/tmp` audit

The follow-up scan measured **31.70 GB** in `/private/tmp`. The five folders below account for **31.05 GB** and belong to your account. Xcode metadata in all five points to the same project, `~/Downloads/freeprints_ios_4/PhotoBooks/Wrenda.xcodeproj`. The review found no open files in those folders among the visible processes running under your account at scan time. Confirm the corresponding jobs are finished before moving anything.

| Directory | Total | Build intermediates | Built products | Module caches and index |
|---|---:|---:|---:|---:|
| `/private/tmp/pb-cover-offset-build` | 7.01 GB | 4.12 GB | 1.18 GB | 1.72 GB |
| `/private/tmp/pinned-header-color-validation-20261118` | 6.15 GB | 3.75 GB | 1.18 GB | 1.22 GB |
| `/private/tmp/codex-memories-wrenda.An9NlU` | 6.03 GB | 3.60 GB | 1.18 GB | 1.22 GB |
| `/private/tmp/wbk-myprojects-navigation-build` | 5.94 GB | 3.54 GB | 1.18 GB | 1.22 GB |
| `/private/tmp/codex-pb-size-picker-build` | 5.91 GB | 3.51 GB | 1.18 GB | 1.22 GB |
| **Total** | **31.05 GB** | **18.52 GB** | **5.89 GB** | **6.59 GB** |

Totals include logs and other small files omitted from the breakdown. In the `codex-memories-wrenda.An9NlU` folder, the Xcode output is nested one level deeper under `DerivedData/`.

- **Compiler caches and index, 6.59 GB.** `ModuleCache.noindex` (**4.05 GB**), `SDKExplicitPrecompiledModules` (**1.77 GB**), and `Index.noindex` (**0.77 GB**) can be rebuilt. These are the first folders to move if you want to retain the compiled app and logs.
- **Build intermediates, 18.52 GB.** `Build/Intermediates.noindex` contains generated build databases, compiled assets and task data. The largest examples include a **174 MB** compiled test `Assets.car` and a **117 MB** `XCBuildData/build.db` in `pb-cover-offset-build`. Xcode can rebuild these, with a slower next build.
- **Built products, 5.89 GB.** `Build/Products` contains the debug app, compiled resources and other outputs. Each build produced a roughly **342–343 MB** `FreePrints Photobooks.debug.dylib`, and all five binary sizes differ. Preserve any exact build you still need to compare, reinstall or debug. The scan found no `.xcarchive`, `.ipa`, or `SourcePackages` paths within the five folders.
- **Logs and other files.** `codex-memories-wrenda.An9NlU` contains `build.log` (**0.84 MB**) and `build-retry.log` (**33.44 MB**) beside `DerivedData/`. Separate logs sit directly under `/private/tmp`, including `pb-cover-offset-build.log` (**31.91 MB**), `wbk-myprojects-navigation-build.log` (**32.69 MB**), and `codex-pb-size-picker-build.log` (**32.30 MB**). Logs can be kept separately if you only need the build history. About **0.65 GB** sits outside the five folders, including logs, screenshots, and other temporary work.

**Diff and duplicate check.** The scan found no regular files ending in `.diff`, `.patch`, or `.rej` under `/private/tmp`. The five **70.49 MB** on-demand resource `Assets.car` files have matching SHA-256 hashes. The five **59.22 MB** main app `Assets.car` files have three distinct hashes despite matching sizes. Keep each app bundle intact and move an unneeded build as a unit.

## Files to archive to an external drive

- **7.9 GB screen recording.** The file is `~/Library/ScreenRecordings/8ADB6F3E-FF99-4629-A940-CC1CB4E69308.mov`. Copy it to the external drive and verify it plays before moving the original off the Mac.
- **9.9 GB FreePrints checkout.** `~/Downloads/freeprints_ios_2` and `~/Downloads/freeprints_ios_3` each measure **9.9 GB**. Both had the same checked-out commit, matching branch and tag refs, and a matching stash. Both had **27 ignored entries**. Three Git pack pairs, including a submodule pack, were byte-identical and totaled **8.4 GB per checkout**. Review the ignored files before archiving one whole inactive checkout, and keep its `.git` directory intact. The measured pack sizes do not establish how many APFS blocks a move would free.
- `~/Downloads` holds about **176.2 GB** overall, including working repositories. Review other checkouts individually for local changes, branches, stashes, and ignored files before archiving them.

Moving a folder to another location on the startup drive keeps its storage on that drive.

## Review in Xcode or the owning app

| Measured size | What I found | How to review it |
|---:|---|---|
| **187.3 GB** | Simulator device data in `~/Library/Developer/CoreSimulator/Devices`. The two largest are iPad Pro 13-inch (M5) devices on iOS 26.5 (**20.4 GB**) and iOS 27.0 (**15.2 GB**). | Review unused devices in **Xcode → Window → Devices and Simulators**. Preserve device data you need for testing. [Apple’s simulator guide](https://developer.apple.com/documentation/safari-developer-tools/adding-additional-simulators) |
| **70.7 GB** | Eight iOS runtime assets under `/System/Volumes/Data/System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime`. iOS 27.0 and 27.2 each had two distinct builds. | Manage unused runtimes through **Xcode → Settings → Components**. Use the build numbers printed by the script to identify them. [Apple’s Xcode components guide](https://developer.apple.com/documentation/xcode/downloading-and-installing-additional-xcode-components) |
| **66.4 GB** | Physical-device debugging support in `~/Library/Developer/Xcode/iOS DeviceSupport`. The two largest iPhone17,3 support folders total **27.9 GB**. | Review older OS builds after checking which physical devices and crash logs still need those symbols. |
| **36.0 GB** | Cursor app database and its backup at `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb` (**24.4 GB**) and `state.vscdb.backup` (**11.6 GB**). | Preserve these as app state. |
| **27.1 GB** | DingTalk app data under `~/Library/Application Support/DingTalkMac`, including a **10.6 GB** `resource_cache` and separate local databases and attachments. | Review cache and attachment storage from within DingTalk. |

## Desktop review script

`storage-review.command` is already on the Desktop. Every mode is read-only and prints its results to Terminal.

```sh
sh "$HOME/Desktop/storage-review.command"
sh "$HOME/Desktop/storage-review.command" --details
sh "$HOME/Desktop/storage-review.command" --duplicate
```

The default mode prints the main candidates. `--details` lists larger folders, simulator device names, and runtime builds. `--duplicate` compares the three FreePrints Git pack pairs byte for byte. If Terminal cannot list APFS snapshots, **Disk Utility → View → Show APFS Snapshots** provides a second way to check. [Apple’s Disk Utility guide](https://support.apple.com/guide/disk-utility/dskuf82354dc/mac)

## Reviewed cleanup plan

`storage-cleanup.command` on the Desktop opens in read-only preview. In an interactive mode, each temporary build folder is shown once with its reviewed relative paths. Answer `y` to select all listed paths in that group or `s` to choose them individually. The Xet cache and DeviceSupport paths have individual prompts. Enter defaults to `n`. The script then prints the selected paths and total size, clears any queued input, and waits for a fresh lowercase `y`. Everything before that final answer is read-only. Any other answer, Enter, or end-of-input cancels the batch.

Use `--delete` or `--delete-caches` for permanent deletion. Use `--hold` or `--hold-caches` to move the approved items into a private batch folder under `~/Library/Application Support/Storage Cleanup Hold` instead. Hold mode uses same-volume renames.

The script accepts specific reviewed paths only. It rejects root and parent directories, symlinked paths, mounted volumes, paths in use, and candidates containing known protected entries such as Git metadata, source packages, Xcode archives, and dSYMs. The device option checks that the retained `arm64e` symbol cache is still present and finalized.

| Area | Measured | Selected paths |
|---|---:|---|
| `/private/tmp` | **25.11 GB** | Only `Build/Intermediates.noindex`, indexes, and compiler caches in the five reviewed Wrenda build folders. `Build/Products`, logs, and project metadata are outside the move list. Finish the jobs before moving generated files. |
| `~/.cache/huggingface/xet` | **9.97 GB** | Only the verified Xet `chunk-cache`. Upload staging was empty during the audit and is preserved along with logs and the Hub cache. Finish any transfers first. [Hugging Face cache documentation](https://huggingface.co/docs/huggingface_hub/en/guides/manage-cache) |
| `~/Library/Developer/Xcode/iOS DeviceSupport` | **27.89 GB** | Only `iPhone17,3 27.0 (24A5370h)` and `iPhone17,3 27.0 (24A5408d)`. Both have a 27.0 `arm64e` symbol cache and an additional top-level symbol set marked 26.5 or 26.6, respectively. |
| **Total** | **62.97 GB** | Measured size of reviewed candidates. |

**DeviceSupport retention.** Keep `iPhone17,3 27.0.1 (24A446)` and the single cached version for every other device model. Also keep `iPhone17,3 27.0 (24A437)` (**7.09 GB**) because its `arm64e/Info.plist` records **27.1**, even though Finder labels the folder **27.0**. A byte comparison found **4,633 symbol files that differ** from the retained `24A446` cache, so the latter does not preserve that symbol set.

Move older device symbols aside only if you no longer debug those OS builds or need to symbolicate crash reports from them. Xcode can recollect matching symbols from a device that still runs the needed release. Use the cache-only mode if you may need the older symbols. [Apple’s device symbol documentation](https://developer.apple.com/documentation/xcode/adding-identifiable-symbol-names-to-a-crash-report)

During the live check, `lldb-rpc-server` held files open in both reviewed DeviceSupport folders. End the debug session and quit Xcode before changing those folders. The script reports open files in preview and blocks operations while they remain open.

```sh
"$HOME/Desktop/storage-cleanup.command"                 # Preview only
"$HOME/Desktop/storage-cleanup.command" --delete-caches # Delete reviewed build intermediates and Xet chunks
"$HOME/Desktop/storage-cleanup.command" --delete        # Also offer the two reviewed DeviceSupport folders
"$HOME/Desktop/storage-cleanup.command" --hold-caches   # Move reviewed build intermediates and Xet chunks
"$HOME/Desktop/storage-cleanup.command" --hold          # Also offer the two reviewed DeviceSupport folders
```

The final summary lists each fully deleted or successfully moved path and the total size measured before the operation. Hold mode prints the batch folder. Inside it, each item retains its original directory structure for restoration. A same-disk move does not free disk space. Finder’s automatic 30-day Trash removal was enabled during the audit, so hold mode stores approved files outside Trash. [Apple’s Trash guide](https://support.apple.com/guide/mac-help/delete-files-and-folders-on-mac-mchlp1093/mac)

No reviewed files were moved or deleted during the live preview.

## Cleanup run transcript

The supplied transcript records 33 directories deleted and 62.97 GB measured before the operation.

```text
➜  Desktop sh storage-cleanup.command --delete
Checking reviewed cleanup paths.
  Built app products, build logs, and metadata are preserved.
  Upload staging and the Hugging Face Hub cache are preserved.
  Keeping /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0.1 (24A446)
  Keeping /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A437) because its symbols report 27.1 and differ from 24A446.
  Older crash reports may require the exact symbols listed above.

33 eligible directories, approximately 62.97 GB before APFS sharing.

Choose a group or path. Press Enter for no. For a group, s lets you choose individual paths.
Finish active builds and transfers, and quit Xcode before removing device symbols.

/private/tmp/pb-cover-offset-build/
   4.12 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 156.48 MB   Index.noindex
   1.21 GB   ModuleCache.noindex
 353.35 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
Permanently delete these 6 listed paths (5.84 GB)? [y/N/s] y

/private/tmp/pinned-header-color-validation-20261118/
   3.75 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 150.93 MB   Index.noindex
 712.17 MB   ModuleCache.noindex
 353.40 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
Permanently delete these 6 listed paths (4.97 GB)? [y/N/s] y

/private/tmp/codex-memories-wrenda.An9NlU/
   3.60 GB   DerivedData/Build/Intermediates.noindex
  28.67 KB   DerivedData/CompilationCache.noindex
 152.67 MB   DerivedData/Index.noindex
 712.18 MB   DerivedData/ModuleCache.noindex
 353.41 MB   DerivedData/SDKExplicitPrecompiledModules
   1.59 MB   DerivedData/SDKStatCaches.noindex
Permanently delete these 6 listed paths (4.82 GB)? [y/N/s] y

/private/tmp/wbk-myprojects-navigation-build/
   3.54 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 151.51 MB   Index.noindex
 711.48 MB   ModuleCache.noindex
 353.37 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
Permanently delete these 6 listed paths (4.76 GB)? [y/N/s] y

/private/tmp/codex-pb-size-picker-build/
   3.51 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 153.72 MB   Index.noindex
 710.39 MB   ModuleCache.noindex
 353.36 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
Permanently delete these 6 listed paths (4.73 GB)? [y/N/s] y
Permanently delete /Users/gavinxiang/.cache/huggingface/xet/https___cas_serv-tGqkUaZf_CBPHQ6h/chunk-cache (9.97 GB)? [y/N] y
Permanently delete /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5370h) (13.88 GB)? [y/N] y
Permanently delete /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5408d) (14.01 GB)? [y/N] y

Paths selected for permanent deletion

/private/tmp/pb-cover-offset-build/
   4.12 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 156.48 MB   Index.noindex
   1.21 GB   ModuleCache.noindex
 353.35 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/pinned-header-color-validation-20261118/
   3.75 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 150.93 MB   Index.noindex
 712.17 MB   ModuleCache.noindex
 353.40 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/codex-memories-wrenda.An9NlU/
   3.60 GB   DerivedData/Build/Intermediates.noindex
  28.67 KB   DerivedData/CompilationCache.noindex
 152.67 MB   DerivedData/Index.noindex
 712.18 MB   DerivedData/ModuleCache.noindex
 353.41 MB   DerivedData/SDKExplicitPrecompiledModules
   1.59 MB   DerivedData/SDKStatCaches.noindex

/private/tmp/wbk-myprojects-navigation-build/
   3.54 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 151.51 MB   Index.noindex
 711.48 MB   ModuleCache.noindex
 353.37 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/codex-pb-size-picker-build/
   3.51 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 153.72 MB   Index.noindex
 710.39 MB   ModuleCache.noindex
 353.36 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
   9.97 GB   /Users/gavinxiang/.cache/huggingface/xet/https___cas_serv-tGqkUaZf_CBPHQ6h/chunk-cache
  13.88 GB   /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5370h)
  14.01 GB   /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5408d)
33 directories, approximately 62.97 GB.
Final confirmation. Proceed with the listed paths? [y/N] y

Deletion summary

/private/tmp/pb-cover-offset-build/
   4.12 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 156.48 MB   Index.noindex
   1.21 GB   ModuleCache.noindex
 353.35 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/pinned-header-color-validation-20261118/
   3.75 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 150.93 MB   Index.noindex
 712.17 MB   ModuleCache.noindex
 353.40 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/codex-memories-wrenda.An9NlU/
   3.60 GB   DerivedData/Build/Intermediates.noindex
  28.67 KB   DerivedData/CompilationCache.noindex
 152.67 MB   DerivedData/Index.noindex
 712.18 MB   DerivedData/ModuleCache.noindex
 353.41 MB   DerivedData/SDKExplicitPrecompiledModules
   1.59 MB   DerivedData/SDKStatCaches.noindex

/private/tmp/wbk-myprojects-navigation-build/
   3.54 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 151.51 MB   Index.noindex
 711.48 MB   ModuleCache.noindex
 353.37 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex

/private/tmp/codex-pb-size-picker-build/
   3.51 GB   Build/Intermediates.noindex
  28.67 KB   CompilationCache.noindex
 153.72 MB   Index.noindex
 710.39 MB   ModuleCache.noindex
 353.36 MB   SDKExplicitPrecompiledModules
   1.59 MB   SDKStatCaches.noindex
   9.97 GB   /Users/gavinxiang/.cache/huggingface/xet/https___cas_serv-tGqkUaZf_CBPHQ6h/chunk-cache
  13.88 GB   /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5370h)
  14.01 GB   /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport/iPhone17,3 27.0 (24A5408d)
Directories deleted: 33. Total size: 62.97 GB (measured before the operation).
```

## Storage review run transcript

The supplied review run reported **110 GiB available**, **88% used**, and no APFS snapshots on the Data volume.

```text
➜  Desktop sh storage-review.command

Startup volume and APFS snapshots

Filesystem      Size    Used   Avail Capacity iused ifree %iused  Mounted on
/dev/disk3s1    926Gi   783Gi   110Gi      88%  8.5M  1.2G    1%   /System/Volumes/Data

No snapshots for disk3s1

Rebuildable caches to review after closing their apps

  100.61 GB  /Users/gavinxiang/Library/Developer/Xcode/DerivedData
    4.26 GB  /Users/gavinxiang/Library/Developer/Xcode/DocumentationCache
   10.90 GB  /Users/gavinxiang/Library/Caches/org.swift.swiftpm
    3.65 GB  /Users/gavinxiang/.cache/huggingface/hub
    0.01 GB  /Users/gavinxiang/.cache/huggingface/xet
    3.04 GB  /Users/gavinxiang/Library/Caches/vscode-cpptools
    4.97 GB  /Users/gavinxiang/Downloads/PRTBusinessUnit/.build
    2.17 GB  /Users/gavinxiang/Downloads/common_ios_prt_select_photo/.build
    1.13 GB  /Users/gavinxiang/Downloads/fp_ios_address/.build

Temporary Xcode build output and logs to review

    1.18 GB  /private/tmp/pb-cover-offset-build
    1.18 GB  /private/tmp/pinned-header-color-validation-20261118
    1.22 GB  /private/tmp/codex-memories-wrenda.An9NlU
    1.18 GB  /private/tmp/wbk-myprojects-navigation-build
    1.18 GB  /private/tmp/codex-pb-size-picker-build

Review these individually after the corresponding builds and Codex jobs have finished.

Xcode-managed components and simulator data

  187.29 GB  /Users/gavinxiang/Library/Developer/CoreSimulator/Devices
   70.74 GB  /System/Volumes/Data/System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime
   38.56 GB  /Users/gavinxiang/Library/Developer/Xcode/iOS DeviceSupport

Review devices in Xcode > Window > Devices and Simulators. Review runtimes in Xcode > Settings > Components.

User and app data to preserve or review in the owning app

   24.37 GB  /Users/gavinxiang/Library/Application Support/Cursor/User/globalStorage/state.vscdb
   11.61 GB  /Users/gavinxiang/Library/Application Support/Cursor/User/globalStorage/state.vscdb.backup
   27.16 GB  /Users/gavinxiang/Library/Application Support/DingTalkMac
   unavailable  /Users/gavinxiang/Library/ScreenRecordings/8ADB6F3E-FF99-4629-A940-CC1CB4E69308.mov
    9.94 GB  /Users/gavinxiang/Downloads/freeprints_ios_2
    9.94 GB  /Users/gavinxiang/Downloads/freeprints_ios_3

To archive recordings or an inactive checkout, copy to an external drive and verify the copy before approving a move.
```

## Shell script source

### storage-cleanup.command

Current Desktop script for the interactive cleanup run.

```bash
#!/bin/bash
# The default mode is read-only. All filesystem changes require per-path
# approval and a separate confirmation after the final summary.
set -o pipefail
export LC_ALL=C
unset CDPATH

stop() {
  printf '%s\n' "$*" >&2
  exit 1
}

usage() {
  printf '%s\n' \
    'storage-cleanup.command                 Preview the full reviewed plan' \
    'storage-cleanup.command --delete        Choose reviewed caches and older symbols for permanent deletion' \
    'storage-cleanup.command --delete-caches Choose reviewed build intermediates and Xet chunks for permanent deletion' \
    'storage-cleanup.command --hold          Choose reviewed caches and older symbols to move to a holding folder' \
    'storage-cleanup.command --hold-caches   Choose reviewed build intermediates and Xet chunks to move' \
    'storage-cleanup.command --help          Show usage'
}

mode=${1:---preview}
operation=hold
caches_only=0
(( $# <= 1 )) || stop 'Pass one option. Use --help for the available modes.'
case "$mode" in
  --help|-h) usage; exit 0 ;;
  --preview) ;;
  --delete|--delete-caches|--hold|--hold-caches)
    [[ -t 0 && -t 1 ]] || stop 'File changes require an interactive terminal.'
    ;;
  *) usage >&2; exit 2 ;;
esac
case "$mode" in --delete|--delete-caches) operation=delete ;; esac
case "$mode" in --delete-caches|--hold-caches) caches_only=1 ;; esac

uid=$(/usr/bin/id -u) || stop 'Cannot identify the current user.'
username=$(/usr/bin/id -un) || stop 'Cannot identify the current user.'
[[ "$uid" != 0 && "$HOME" == /Users/* ]] || stop 'Run as your usual Mac account, without sudo.'

device_root="$HOME/Library/Developer/Xcode/iOS DeviceSupport"
keeper="$device_root/iPhone17,3 27.0.1 (24A446)"
held="$device_root/iPhone17,3 27.0 (24A437)"
old_devices=(
  "$device_root/iPhone17,3 27.0 (24A5370h)"
  "$device_root/iPhone17,3 27.0 (24A5408d)"
)
xet_root="$HOME/.cache/huggingface/xet"
xet_chunks="$xet_root/https___cas_serv-tGqkUaZf_CBPHQ6h/chunk-cache"
temp_roots=(
  '/private/tmp/pb-cover-offset-build'
  '/private/tmp/pinned-header-color-validation-20261118'
  '/private/tmp/codex-memories-wrenda.An9NlU/DerivedData'
  '/private/tmp/wbk-myprojects-navigation-build'
  '/private/tmp/codex-pb-size-picker-build'
)
temp_children=(
  Build/Intermediates.noindex CompilationCache.noindex Index.noindex ModuleCache.noindex
  SDKExplicitPrecompiledModules SDKStatCaches.noindex
)
expected_project="$HOME/Downloads/freeprints_ios_4/PhotoBooks/Wrenda.xcodeproj"
holding_parent="$HOME/Library/Application Support"
holding_root="$holding_parent/Storage Cleanup Hold"

is_reviewed_target() {
  local item="$1" root child old_device
  case "$item" in
    /|/private/tmp|/tmp|"$HOME"|"$xet_root"|"$device_root") return 1 ;;
  esac
  [[ "$item" == "$xet_chunks" ]] && return 0
  for old_device in "${old_devices[@]}"; do
    [[ "$item" == "$old_device" && "$caches_only" == 0 ]] && return 0
  done
  for root in "${temp_roots[@]}"; do
    for child in "${temp_children[@]}"; do
      [[ "$item" == "$root/$child" ]] && return 0
    done
  done
  return 1
}

identity() {
  local item="$1" parent="${1%/*}" physical metadata filesystem inode owner modified
  [[ -d "$item" && ! -L "$item" ]] || return 1
  physical=$(cd -P -- "$item" && pwd -P) || return 1
  [[ "$physical" == "$item" ]] || return 1
  metadata=$(/usr/bin/stat -f '%d %i %u %m' "$item") || return 1
  read -r filesystem inode owner modified <<< "$metadata"
  [[ "$owner" == "$uid" && "$filesystem" == "$(/usr/bin/stat -f '%d' "$parent")" ]] || return 1
  printf '%s:%s:%s:%s\n' "$filesystem" "$inode" "$owner" "$modified"
}

check_keeper() {
  identity "$keeper" >/dev/null &&
    [[ -f "$keeper/arm64e/.finalized" && ! -L "$keeper/arm64e/.finalized" ]] &&
    identity "$keeper/arm64e/Symbols" >/dev/null
}

protected_entry() {
  /usr/bin/find -x "$1" -mindepth 1 \( \
    -name .git -o -name .svn -o -name SourcePackages -o \
    -iname '*.xcarchive' -o -iname '*.ipa' -o -iname '*.dsym' -o \
    -iname '*.xcodeproj' -o -iname '*.xcworkspace' -o \
    -iname '*.patch' -o -iname '*.diff' -o -iname '*.ips' -o -iname '*.crash' -o \
    -iname '*.p12' -o -iname '*.mobileprovision' \
  \) -print -quit
}

check_holding_volume() {
  local source_device holding_device
  source_device=$(/usr/bin/stat -f '%d' "$1") || stop "Could not verify the volume for $1"
  holding_device=$(/usr/bin/stat -f '%d' "$2") || stop 'Could not verify the holding folder’s volume.'
  [[ "$source_device" == "$holding_device" ]] || stop "Target and holding folder are on different volumes: $1"
}

check_nested_mounts() {
  local mounted
  mounted=$(/sbin/mount | /usr/bin/awk -v item="$1" '
    {
      separator = index($0, " on ")
      if (!separator) next
      location = substr($0, separator + 4)
      sub(/ \([^()]*\)$/, "", location)
      sub(/^\/System\/Volumes\/Data\//, "/", location)
      sub(/^\/tmp\//, "/private/tmp/", location)
      if (location == item || index(location, item "/") == 1) print location
    }
  ') || stop 'Could not verify mounted volumes.'
  [[ -z "$mounted" ]] || stop "Target contains a mounted volume: $mounted"
}

targets=()
identities=()
sizes_kib=()
activity_roots=()
total_kib=0

measure_kib() {
  local measurement kib
  measurement=$(/usr/bin/du -skx "$1") || return 1
  kib=${measurement%%$'\t'*}
  [[ "$kib" =~ ^[0-9]+$ ]] || return 1
  printf '%s\n' "$kib"
}

format_size() {
  /usr/bin/awk -v kib="$1" 'BEGIN {
    bytes = kib * 1024
    if (bytes >= 1000000000) printf "%.2f GB", bytes / 1000000000
    else if (bytes >= 1000000) printf "%.2f MB", bytes / 1000000
    else if (bytes >= 1000) printf "%.2f KB", bytes / 1000
    else printf "%.0f B", bytes
  }'
}

add_target() {
  local item="$1" check_root="${2:-$1}" before after kib protected
  is_reviewed_target "$item" || stop "Path is outside the reviewed list: $item"
  if [[ ! -e "$item" && ! -L "$item" ]]; then
    return 0
  fi
  before=$(identity "$item") || stop "Unsafe or unexpected directory: $item"
  protected=$(protected_entry "$item") || stop "Could not check contents: $item"
  if [[ -n "$protected" ]]; then
    printf '  Skipping %s because it contains %s\n' "$item" "$protected"
    return 0
  fi
  kib=$(measure_kib "$item") || stop "Could not measure: $item"
  after=$(identity "$item") || stop "Directory changed while scanning: $item"
  [[ "$before" == "$after" ]] || stop "Directory changed while scanning: $item"
  targets+=("$item")
  identities+=("$before")
  sizes_kib+=("$kib")
  activity_roots+=("$check_root")
  total_kib=$((total_kib + kib))
}

is_build_group() {
  local index="$1" root
  root=${activity_roots[$index]}
  [[ "$root" != "$xet_root" && "${targets[$index]}" == "$root/"* ]]
}

print_targets() {
  local index root label previous_root=''
  for index in "$@"; do
    root=${activity_roots[$index]}
    label=${targets[$index]}
    if is_build_group "$index"; then
      if [[ "$root" != "$previous_root" ]]; then
        printf '\n%s/\n' "$root"
      fi
      label=${label#"$root/"}
    fi
    printf '%10s   %s\n' "$(format_size "${sizes_kib[$index]}")" "$label"
    previous_root=$root
  done
}

select_targets() {
  local index
  for index in "$@"; do
    selected+=("$index")
    selected_roots+=("${activity_roots[$index]}")
    selected_kib=$((selected_kib + sizes_kib[index]))
  done
}

choose_path() {
  local index="$1" label="$2" answer
  while :; do
    printf '%s %s (%s)%s? [y/N] ' "$choose_verb" "$label" "$(format_size "${sizes_kib[$index]}")" "$choose_destination"
    IFS= read -r answer || stop 'Cancelled.'
    case "$answer" in
      y|Y) select_targets "$index"; return 0 ;;
      n|N|'') return 0 ;;
      *) printf 'Enter y or n.\n' ;;
    esac
  done
}

choose_build_group() {
  local root="$1" index total=0 answer
  shift
  print_targets "$@"
  for index in "$@"; do
    total=$((total + sizes_kib[index]))
  done
  while :; do
    printf '%s these %d listed paths (%s)%s? [y/N/s] ' "$choose_verb" "$#" "$(format_size "$total")" "$choose_destination"
    IFS= read -r answer || stop 'Cancelled.'
    case "$answer" in
      y|Y) select_targets "$@"; return 0 ;;
      n|N|'') return 0 ;;
      s|S)
        for index in "$@"; do
          choose_path "$index" "${targets[$index]#"$root/"}"
        done
        return 0
        ;;
      *) printf 'Enter y for all listed paths, n to skip, or s to choose individually.\n' ;;
    esac
  done
}

check_open_files() {
  local listed paths
  paths=$(printf '%s\n' "$@")
  listed=$(/usr/sbin/lsof -nP -a -u "$username" -Fpcn |
    CLEANUP_SCAN_PATHS="$paths" /usr/bin/awk '
      BEGIN {count = split(ENVIRON["CLEANUP_SCAN_PATHS"], roots, "\n")}
      /^p/ {pid = substr($0, 2); processes++; next}
      /^c/ {command = substr($0, 2); next}
      /^n\// {
        name = substr($0, 2)
        sub(/^\/System\/Volumes\/Data\//, "/", name)
        sub(/^\/tmp\//, "/private/tmp/", name)
        for (i = 1; i <= count; i++) {
          if (roots[i] != "" && (name == roots[i] || index(name, roots[i] "/") == 1)) {
            key = pid SUBSEP roots[i]
            if (!seen[key]++) print command, "(PID " pid ")", roots[i]
          }
        }
      }
      END {if (!processes) exit 1}
    ') || {
    printf 'Could not verify open files.\n' >&2
    return 1
  }
  if [[ -n "$listed" ]]; then
    printf '\nOpen files were detected:\n%s\n' "$listed" >&2
    return 1
  fi
}

print_action_summary() {
  printf '\n%s summary\n' "$summary_title"
  print_targets "${completed[@]}"
  printf 'Directories %s: %d. Total size: %s (measured before the operation).\n' \
    "$completed_verb" "${#completed[@]}" "$(format_size "$completed_kib")"
  if [[ "$operation" == hold ]] && (( ${#completed[@]} > 0 )); then
    printf 'Holding batch: %s\n' "$holding_batch"
    printf 'Each item retains its original directory structure inside the batch.\n'
    printf 'The holding folder is on this disk. Moving into it does not free disk space.\n'
  fi
}

prepare_holding_folder() {
  if [[ ! -e "$holding_root" && ! -L "$holding_root" ]]; then
    /bin/mkdir -m 700 "$holding_root" || stop 'Could not create the holding folder.'
  fi
  identity "$holding_root" >/dev/null || stop 'Could not verify the holding folder.'
  holding_batch=$(/usr/bin/mktemp -d "$holding_root/cleanup.XXXXXXXX") || stop 'Could not create the batch folder.'
  identity "$holding_batch" >/dev/null || stop 'Could not verify the batch folder.'
}

move_to_holding() {
  local item="$1" destination="$holding_batch$1"
  check_holding_volume "$item" "$holding_batch"
  /bin/mkdir -p "${destination%/*}" || stop "Could not create the destination for $item"
  identity "${destination%/*}" >/dev/null || stop "Could not verify the destination for $item"
  # A same-volume rename fails rather than falling back to copy and remove.
  /usr/bin/perl -e '
    my ($source, $destination) = @ARGV;
    die "Destination already exists: $destination\n" if -e $destination || -l $destination;
    rename($source, $destination) or die "Could not move $source: $!\n";
  ' "$item" "$destination" || stop "Could not move this path: $item"
}

printf 'Checking reviewed cleanup paths.\n'
for build_root in "${temp_roots[@]}"; do
  if [[ ! -e "$build_root" && ! -L "$build_root" ]]; then
    continue
  fi
  identity "$build_root" >/dev/null || stop "Unexpected build directory: $build_root"
  [[ ! -L "$build_root/info.plist" ]] || stop "Unexpected build metadata: $build_root"
  project=$(/usr/bin/plutil -extract WorkspacePath raw -o - "$build_root/info.plist") ||
    stop "Could not verify the Xcode workspace for $build_root"
  [[ "$project" == "$expected_project" ]] || stop "The Xcode workspace changed for $build_root"
  for child in "${temp_children[@]}"; do
    add_target "$build_root/$child" "${build_root%/DerivedData}"
  done
done
printf '  Built app products, build logs, and metadata are preserved.\n'

add_target "$xet_chunks" "$xet_root"
printf '  Upload staging and the Hugging Face Hub cache are preserved.\n'

if (( ! caches_only )); then
  if check_keeper; then
    for item in "${old_devices[@]}"; do
      add_target "$item"
    done
    printf '  Keeping %s\n' "$keeper"
    printf '  Keeping %s because its symbols report 27.1 and differ from 24A446.\n' "$held"
    printf '  Older crash reports may require the exact symbols listed above.\n'
  else
    printf '  Skipping older symbols because the retained 27.0.1 symbol cache could not be verified.\n'
  fi
fi

printf '\n%d eligible directories, approximately %s before APFS sharing.\n' \
  "${#targets[@]}" "$(format_size "$total_kib")"

if [[ "$mode" == --preview ]]; then
  print_targets "${!targets[@]}"
  if (( ${#targets[@]} > 0 )) && ! check_open_files "${activity_roots[@]}"; then
    printf 'Close the listed processes before changing these paths.\n'
  fi
  printf 'Preview only. Use --help for the interactive move and delete modes.\n'
  exit 0
fi

completed=()
completed_kib=0
if [[ "$operation" == delete ]]; then
  choose_verb='Permanently delete'
  choose_destination=''
  selection_title='Paths selected for permanent deletion'
  summary_title='Deletion'
  completed_verb='deleted'
else
  choose_verb='Move'
  choose_destination=' to the holding folder'
  selection_title='Paths selected for the holding folder'
  summary_title='Move'
  completed_verb='moved'
fi
trap print_action_summary EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
(( ${#targets[@]} > 0 )) || exit 0

selected=()
selected_roots=()
selected_kib=0
printf '\nChoose a group or path. Press Enter for no. For a group, s lets you choose individual paths.\n'
printf 'Finish active builds and transfers, and quit Xcode before removing device symbols.\n'
index=0
while (( index < ${#targets[@]} )); do
  if is_build_group "$index"; then
    group_root=${activity_roots[$index]}
    group_indices=()
    while (( index < ${#targets[@]} )) && [[ "${activity_roots[$index]}" == "$group_root" ]]; do
      group_indices+=("$index")
      (( index += 1 ))
    done
    choose_build_group "$group_root" "${group_indices[@]}"
  else
    choose_path "$index" "${targets[$index]}"
    (( index += 1 ))
  fi
done
if (( ${#selected[@]} == 0 )); then
  printf 'No paths selected.\n'
  exit 0
fi
check_open_files "${selected_roots[@]}" ||
  stop 'Cancelled before final confirmation. Close the affected processes and run again.'

printf '\n%s\n' "$selection_title"
print_targets "${selected[@]}"
printf '%d directories, approximately %s.\n' "${#selected[@]}" "$(format_size "$selected_kib")"
if [[ "$operation" == hold ]]; then
  printf 'Holding folder: %s\n' "$holding_root"
fi

# Discard type-ahead so the final approval is entered after the summary.
/usr/bin/perl -MPOSIX=tcflush,TCIFLUSH -e '
  my $result = tcflush(fileno(STDIN), TCIFLUSH);
  exit(defined($result) && $result == 0 ? 0 : 1);
' || stop 'Could not clear pending terminal input. No files were changed.'
printf 'Final confirmation. Proceed with the listed paths? [y/N] '
IFS= read -r answer || stop 'Cancelled. No files were changed.'
[[ "$answer" == y ]] || stop 'Cancelled. No files were changed.'

check_open_files "${selected_roots[@]}" ||
  stop 'Cancelled after confirmation. Close the affected processes and run again.'
if [[ "$operation" == hold ]]; then
  identity "$holding_parent" >/dev/null || stop 'Could not verify the holding folder’s parent.'
fi
for index in "${selected[@]}"; do
  item=${targets[$index]}
  is_reviewed_target "$item" || stop "Path is outside the reviewed list: $item"
  [[ "$(identity "$item")" == "${identities[$index]}" ]] || stop "Directory changed after preview: $item"
  check_nested_mounts "$item"
  if [[ "$operation" == hold ]]; then
    check_holding_volume "$item" "$holding_parent"
  fi
done

if [[ "$operation" == hold ]]; then
  prepare_holding_folder
fi

for index in "${selected[@]}"; do
  item=${targets[$index]}
  is_reviewed_target "$item" || stop "Path is outside the reviewed list: $item"
  check_open_files "${activity_roots[$index]}" || stop "Path is in use: $item"
  [[ "$(identity "$item")" == "${identities[$index]}" ]] || stop "Directory changed after preview: $item"
  protected=$(protected_entry "$item") || stop "Could not check contents: $item"
  [[ -z "$protected" ]] || stop "Protected entry found: $protected"
  kib=$(measure_kib "$item") || stop "Could not remeasure: $item"
  [[ "$kib" == "${sizes_kib[$index]}" ]] || stop "Size changed after preview: $item. Run the preview again."
  check_nested_mounts "$item"
  if [[ "$item" == "$device_root/"* ]]; then
    check_keeper || stop 'The retained device symbol cache changed.'
  fi
  [[ "$(identity "$item")" == "${identities[$index]}" ]] || stop "Directory changed after preview: $item"
  if [[ "$operation" == delete ]]; then
    /bin/rm -rfx -- "$item" || stop "Deletion failed or was incomplete: $item"
    [[ ! -e "$item" && ! -L "$item" ]] || stop "Deletion was incomplete: $item"
  else
    move_to_holding "$item"
  fi
  completed+=("$index")
  completed_kib=$((completed_kib + kib))
done
```

### storage-review.command

Read-only review script, updated to run under `sh`.

```sh
#!/bin/sh
# macOS storage review. This script only reads metadata and, in duplicate mode,
# compares known pairs of Git pack files. All output goes to the terminal.
set -u
export LC_ALL=C

data=/System/Volumes/Data
library="$HOME/Library"
xcode="$library/Developer/Xcode"
devices="$library/Developer/CoreSimulator/Devices"
assets="$data/System/Library/AssetsV2/com_apple_MobileAsset_iOSSimulatorRuntime"
cursor_state="$library/Application Support/Cursor/User/globalStorage"
dingtalk="$library/Application Support/DingTalkMac"
downloads="$HOME/Downloads"
recording="$library/ScreenRecordings/8ADB6F3E-FF99-4629-A940-CC1CB4E69308.mov"

usage() {
  cat <<'USAGE'
Storage review (read-only)

  storage-review.command               Show the main storage candidates
  storage-review.command --details     List the largest simulator devices,
                                       build folders and other subdirectories
  storage-review.command --duplicate   Compare three FreePrints Git pack pairs
  storage-review.command --help        Show usage

The script prints approximate allocated sizes in decimal GB. APFS shared blocks
and protected directories can affect measurements. No files are moved or deleted.
USAGE
}

section() {
  printf '\n%s\n' "$1"
}

size() (
  path=$1
  if [ ! -e "$path" ]; then
    printf '   unavailable  %s\n' "$path"
    return
  fi
  if ! result=$(/usr/bin/du -skx "$path"); then
    printf '   incomplete   %s\n' "$path"
    return
  fi
  printf '%s\n' "$result" |
    /usr/bin/awk -F '\t' 'NR == 1 {printf "%8.2f GB  %s\n", $1 * 1024 / 1000000000, $2}'
)

top_children() (
  path=$1
  [ -d "$path" ] || return 0
  if ! result=$(/usr/bin/du -kx -d 1 "$path"); then
    printf 'Some entries under %s could not be measured.\n' "$path" >&2
  fi
  printf '%s\n' "$result" |
    /usr/bin/sort -nr |
    /usr/bin/awk -F '\t' -v root="$path" '
      $2 && $2 != root && $1 > 0 && n++ < 12 {
        printf "%8.2f GB  %s\n", $1 * 1024 / 1000000000, $2
      }'
)

review_details() (
  section 'Largest simulator device directories'
  top_children "$devices" |
    while IFS= read -r record; do
      printf '%s\n' "$record"
      location=${record#*' GB  '}
      info="$location/device.plist"
      if [ -f "$info" ]; then
        name=$(/usr/bin/plutil -extract name raw -o - "$info" 2>/dev/null) || name='Unknown device'
        runtime=$(/usr/bin/plutil -extract runtime raw -o - "$info" 2>/dev/null) || runtime='Unknown runtime'
        printf '             %s | %s\n' "$name" "${runtime##*.}"
      else
        printf '             No readable device.plist\n'
      fi
    done

  section 'Simulator runtime assets by version and build'
  for info in "$assets"/*.asset/Info.plist; do
    [ -f "$info" ] || continue
    asset=${info%/Info.plist}
    version=$(/usr/bin/plutil -extract MobileAssetProperties.SimulatorVersion raw -o - "$info" 2>/dev/null) || version='unknown'
    build=$(/usr/bin/plutil -extract MobileAssetProperties.Build raw -o - "$info" 2>/dev/null) || build='unknown'
    printf 'iOS %s (%s)\n' "$version" "$build"
    size "$asset"
  done

  for location in "$xcode/DerivedData" "$xcode/iOS DeviceSupport" "$downloads"; do
    section "Largest directories in $location"
    top_children "$location"
  done
)

compare_pack() (
  relative=$1
  first="$downloads/freeprints_ios_2/$relative"
  second="$downloads/freeprints_ios_3/$relative"
  if [ ! -f "$first" ] || [ ! -f "$second" ] || [ -L "$first" ] || [ -L "$second" ]; then
    printf 'Both regular files must be present for %s.\n' "$relative" >&2
    return 1
  fi
  first_id=$(/usr/bin/stat -f '%d:%i' "$first") || return 1
  second_id=$(/usr/bin/stat -f '%d:%i' "$second") || return 1
  size "$first"
  size "$second"
  if [ "$first_id" = "$second_id" ]; then
    printf 'These names refer to the same inode.\n'
    return 0
  fi
  printf 'Comparing the contents of both files. This can take a minute.\n'
  /usr/bin/cmp -s "$first" "$second"
  status=$?
  case "$status" in
    0) printf 'Byte-identical files with distinct inodes. APFS block sharing is unknown. Preserve each Git object store.\n' ;;
    1) printf 'The files differ.\n' ;;
    *) printf 'The comparison could not be completed.\n' >&2 ;;
  esac
  return "$status"
)

review_duplicates() (
  result=0
  for relative in \
    '.git/objects/pack/pack-83e700986cc0fe9eef73da03fed0db5ebf3418e2.pack' \
    '.git/objects/pack/pack-fefbabf8a15f930abb3897cfc208438356043a00.pack' \
    '.git/modules/FreePrints/MyDealsSDK/objects/pack/pack-aa8d0a31c15f6d4273f3b9013c2b75f678c3564b.pack'; do
    compare_pack "$relative" || result=1
  done
  return "$result"
)

review() (
  section 'Startup volume and APFS snapshots'
  /bin/df -h "$data"
  /usr/sbin/diskutil apfs listSnapshots "$data" ||
    printf 'APFS snapshot listing unavailable. Check Disk Utility > View > Show APFS Snapshots.\n'

  section 'Rebuildable caches to review after closing their apps'
  for path in "$xcode/DerivedData" "$xcode/DocumentationCache" "$library/Caches/org.swift.swiftpm" \
    "$HOME/.cache/huggingface/hub" "$HOME/.cache/huggingface/xet" \
    "$library/Caches/vscode-cpptools" "$downloads/PRTBusinessUnit/.build" \
    "$downloads/common_ios_prt_select_photo/.build" "$downloads/fp_ios_address/.build"; do
    size "$path"
  done

  section 'Temporary Xcode build output and logs to review'
  for path in /private/tmp/pb-cover-offset-build /private/tmp/pinned-header-color-validation-20261118 \
    /private/tmp/codex-memories-wrenda.An9NlU /private/tmp/wbk-myprojects-navigation-build \
    /private/tmp/codex-pb-size-picker-build; do
    size "$path"
  done
  printf 'Review these individually after the corresponding builds and Codex jobs have finished.\n'

  section 'Xcode-managed components and simulator data'
  size "$devices"
  size "$assets"
  size "$xcode/iOS DeviceSupport"
  printf 'Review devices in Xcode > Window > Devices and Simulators. Review runtimes in Xcode > Settings > Components.\n'

  section 'User and app data to preserve or review in the owning app'
  for path in "$cursor_state/state.vscdb" "$cursor_state/state.vscdb.backup" \
    "$dingtalk" "$recording" "$downloads/freeprints_ios_2" "$downloads/freeprints_ios_3"; do
    size "$path"
  done
  printf 'To archive recordings or an inactive checkout, copy to an external drive and verify the copy before approving a move.\n'
)

if [ "$#" -gt 1 ]; then
  usage >&2
  exit 2
fi
case "${1-}" in
  '') review ;;
  --details) review_details ;;
  --duplicate) review_duplicates ;;
  --help|-h) usage ;;
  *) usage >&2; exit 2 ;;
esac
```
