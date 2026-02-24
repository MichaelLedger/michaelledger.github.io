# Speeding Up Swift Package Manager (SPM) Resolution from Github

SPM can be slow resolving packages from GitHub on constrained networks or we may already cloned repos we need locally. Here are practical ways to speed it up or replace the source.

---

## Why is SPM resolve slow (even when `git clone` is fast)?

A direct `git clone https://github.com/owner/repo` of one repo can finish quickly (e.g. a few hundred KB in seconds). The same network can still make **SPM resolve** feel very slow. Reasons:

1. **You're not doing the same operation**
   - **`git clone`** = one repo, one fetch. Done.
   - **`xcodebuild -resolvePackageDependencies`** = SPM must **resolve the whole dependency graph**. For every package (including transitive ones), it has to fetch that repo (or at least its manifest), read `Package.swift`, then do the same for *its* dependencies. So it's many Git operations (clone/fetch per package), not one. Total time = (resolve package 1) + (resolve package 2) + ... + (create working copies for all). Even if each repo is small, doing them one-by-one (and with resolution in between) adds up.

2. **Packages with Git submodules**
   - Some repos (e.g. [swift-h3](https://github.com/JeremyEspresso/swift-h3)) use **Git submodules** (e.g. to wrap a C library). When SPM checks out that package, it may have to deal with submodule setup as well, which can add extra work or slowness compared to a plain clone.

3. **How SPM fetches**
   - SPM typically fetches one dependency at a time during resolution and uses its own layout under DerivedData/cache. So you get more round-trips and more overhead than a single `git clone` in your project folder.

**Takeaway:** Clone is fast because it's one repo; SPM resolve is slow because it's many repos and many steps (and sometimes submodules). Mirroring the slow packages (and using a proxy if needed) is the way to speed it up on the same network.

---

## 1. Use `git config url.*.insteadOf` (recommended)

> **Tested and confirmed working.** `swift package config set-mirror` (section 1c below) did **not** work reliably in practice -- especially with local paths and packages that have Git submodules. The approach that **does** work is `git config --global url.*.insteadOf`, which operates at the Git transport level and handles both the main repo and submodule redirects.

See [section 1b](#1b-local-overrides-alternatives-to-set-mirror-with-a-local-path) for the full step-by-step setup.

---

## 1a. SPM dependency mirroring (may not work -- see note above)

SPM supports **dependency mirroring**: you tell it to fetch a package from a different URL instead of the original.

> **Warning -- `set-mirror` was unreliable in our testing.** Local path mirrors don't work (SPM treats the path as a remote URL). Even remote URL mirrors may not cover submodule fetches. If `set-mirror` doesn't work for you, skip to [section 1b](#1b-local-overrides-alternatives-to-set-mirror-with-a-local-path) and use `git config insteadOf` instead.

```bash
# Run from your project directory (where Package.swift lives)
swift package config set-mirror --original "https://github.com/owner/repo" --mirror "FASTER_REMOTE_URL"
```

**Reference: `swift package config --help`**

```text
OVERVIEW: Manipulate configuration of the package

USAGE: swift package config <subcommand>

OPTIONS:
  --version               Show the version.
  -h, -help, --help       Show help information.

SUBCOMMANDS:
  set-mirror              Set a mirror for a dependency.
  unset-mirror            Remove an existing mirror.
  get-mirror              Print mirror configuration for the given package dependency.

  See 'swift help package config <subcommand>' for detailed help.
```

**Disable mirror / roll back to original URL:** run from the same project directory and use the *exact* original URL (including `.git` if you set a mirror for that variant):

```bash
swift package config unset-mirror --original "https://github.com/owner/repo"
# If you also set a mirror for the .git URL, remove that too:
swift package config unset-mirror --original "https://github.com/owner/repo.git"
```

**Example -- faster remote mirror** (e.g. Gitee, your company Git, or a CDN-backed clone):

```bash
swift package config set-mirror --original "https://github.com/apple/swift-nio" --mirror "https://gitee.com/mirrors/swift-nio"
```

**Xcode app projects (no Package.swift)**

`swift package config` only runs in a directory that contains **Package.swift**. For an **Xcode app** (only `.xcodeproj` / `.xcworkspace`), you get:

```text
error: Could not find Package.swift in this directory or any of its parent directories.
```

**Workaround:** create a minimal `Package.swift` in your **project root** (same folder as the `.xcodeproj`), then run the mirror command there. That creates `.swiftpm/configuration/mirrors.json`, which Xcode may use when resolving the app's SPM dependencies.

```bash
cd /path/to/YourApp   # project root (where .xcodeproj is)

# Minimal Package.swift so `swift package` commands work
echo '// swift-tools-version: 5.9
import PackageDescription
let package = Package(
    name: "Dummy",
    targets: [.target(name: "Dummy", path: ".")]
)' > Package.swift

# Set mirror (use same URL form as in your Xcode project)
swift package config set-mirror --original "https://github.com/JeremyEspresso/swift-h3" --mirror "https://gitee.com/your-mirror/swift-h3"
# If project uses .git URL, set that too:
swift package config set-mirror --original "https://github.com/JeremyEspresso/swift-h3.git" --mirror "https://gitee.com/your-mirror/swift-h3.git"

# Resolve again
xcodebuild -resolvePackageDependencies -scmProvider system
```

You can add `Package.swift` to `.gitignore` if you don't want to commit it; keep `.swiftpm/` if you want to commit mirror config.

**Notes:**

- Mirrors are **per URL string**. If the dependency uses `https://github.com/owner/repo.git`, set a mirror for that exact URL too.
- Config is stored in the project directory (e.g. `.swiftpm/configuration/mirrors.json`) next to the .xcodeproj; global ~/Library/org.swift.swiftpm/ is not used by Xcode.
- **Xcode uses only project-local mirrors:** `<project-root>/.swiftpm/configuration/mirrors.json` (same directory as your `.xcodeproj` or `.xcworkspace`). It does **not** use `~/Library/org.swift.swiftpm/configuration/mirrors.json`. Put `mirrors.json` in the project's `.swiftpm/configuration/`, then **File -> Packages -> Reset Package Caches** and resolve again.
- Remove: `swift package config unset-mirror --original "https://github.com/owner/repo"`
- Check: `swift package config get-mirror --original "https://github.com/owner/repo"`

**Why mirroring can still be slow: packages with Git submodules**

SPM **does not mirror submodules**. Only the main repo URL is redirected. If the package (e.g. [swift-h3](https://github.com/JeremyEspresso/swift-h3)) uses a Git submodule (e.g. for the H3 C library), SPM still fetches that submodule from its original URL (often GitHub), so resolve stays slow even with a mirror for the main repo.

**What you can do:**

1. **Redirect submodule URLs with `insteadOf`** (see [Option B in section 1b](#option-b-git-config-urlinsteadof-works-with--scmprovider-system)). This is the most effective approach: add `insteadOf` rules for every submodule URL so Git fetches them from local disk too. For swift-h3, you need to redirect both `https://github.com/JeremyEspresso/swift-h3` *and* `https://github.com/uber/h3` (the submodule).
2. **Use a proxy** (section 2) so all Git traffic, including submodule fetches, goes through a faster route.
3. **Pre-fill the local clone with submodules** so the checkout is complete before SPM uses it:
   ```bash
   cd /Users/gavinxiang/Downloads/swift-h3
   git submodule update --init --recursive
   ```
   Then clear SPM caches, resolve again. (SPM may still re-fetch the submodule from the remote URL; combine with `insteadOf` or a proxy for reliability.)
4. **Vendor or fork** -- use a fork that vendors the C code instead of a submodule, or a pre-built binary package, if available.

---

## 1b. Local overrides (what actually works)

`set-mirror --mirror "/local/path"` is unreliable because SPM's mirror feature was designed for URL-to-URL remapping. Xcode's built-in SCM often cannot resolve bare filesystem paths as mirrors. The `git config insteadOf` approach below is what actually works.

### Option A: Xcode local package override (recommended for development)

Drag the local package folder into Xcode's project navigator. Xcode detects it matches the remote dependency and uses the local copy instead -- no mirror config needed.

1. Clone the repo locally (with submodules):
   ```bash
   git clone https://github.com/JeremyEspresso/swift-h3 /Users/gavinxiang/Downloads/swift-h3
   cd /Users/gavinxiang/Downloads/swift-h3
   git submodule update --init --recursive
   ```

2. In Xcode, **drag** the `/Users/gavinxiang/Downloads/swift-h3` folder from Finder into the project navigator (left sidebar). Xcode will show a small "local" badge next to the package and use the local version instead of fetching from GitHub.

3. To revert to the remote: remove the local folder reference from the project navigator.

### Option B: `git config url.*.insteadOf` (recommended -- confirmed working)

This redirects at the Git level, which is more reliable than `set-mirror` for local paths because SPM never sees the local path -- Git transparently rewrites the URL before SPM processes it.

> **Gotcha: you must also redirect submodule URLs.** If the package uses Git submodules (e.g. swift-h3 has a submodule pointing to `https://github.com/uber/h3`), redirecting only the main repo URL is not enough. SPM will still fetch the submodule from GitHub, which is where the real slowness comes from. You must add `insteadOf` rules for **every** submodule URL too.

> **Gotcha: `--add` is required for multiple values.** `git config` without `--add` **overwrites** the previous value. If you run two `git config --global url."X".insteadOf` commands with different values, only the second one survives. Use `--add` for the second and subsequent values under the same key.

> **Gotcha: `fatal: transport 'file' not allowed`.** Since Git 2.38.1+ (CVE-2022-39253 security fix), Git blocks the `file` transport protocol by default. When `insteadOf` rewrites an `https://` URL to a local path, Git's submodule clone sees a `file://` transport and refuses it. You **must** explicitly allow it:
> ```bash
> git config --global protocol.file.allow always
> ```
> Without this, submodule clones will fail with `fatal: transport 'file' not allowed` even though the main repo redirect works fine.

**Step 1: Prepare the local clone (full clone with submodules and all tags):**

```bash
git clone https://github.com/JeremyEspresso/swift-h3 /Users/gavinxiang/Downloads/swift-h3
cd /Users/gavinxiang/Downloads/swift-h3
git fetch --all --tags
git submodule update --init --recursive
```

**Step 2: Check what submodule URLs the package uses:**

```bash
cat /Users/gavinxiang/Downloads/swift-h3/.gitmodules
```

Output:
```text
[submodule "Sources/CH3/h3"]
	path = Sources/CH3/h3
	url = https://github.com/uber/h3
```

**Step 3: Set up `insteadOf` for the main repo AND all submodule URLs:**

```bash
# Clean up any previous attempts
git config --global --unset-all url."/Users/gavinxiang/Downloads/swift-h3".insteadOf 2>/dev/null
git config --global --unset-all url."/Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3".insteadOf 2>/dev/null

# Allow the file:// transport protocol (required since Git 2.38.1+)
git config --global protocol.file.allow always

# Redirect swift-h3 main repo (use --add for the second URL form)
git config --global url."/Users/gavinxiang/Downloads/swift-h3".insteadOf "https://github.com/JeremyEspresso/swift-h3"
git config --global --add url."/Users/gavinxiang/Downloads/swift-h3".insteadOf "https://github.com/JeremyEspresso/swift-h3.git"

# Redirect the uber/h3 SUBMODULE to the local copy already inside swift-h3
git config --global url."/Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3".insteadOf "https://github.com/uber/h3"
git config --global --add url."/Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3".insteadOf "https://github.com/uber/h3.git"
```

**Step 4: Verify all four entries are present:**

```bash
git config --global --list | grep insteadof
```

Expected output (4 lines):
```text
url./Users/gavinxiang/Downloads/swift-h3.insteadof=https://github.com/JeremyEspresso/swift-h3
url./Users/gavinxiang/Downloads/swift-h3.insteadof=https://github.com/JeremyEspresso/swift-h3.git
url./Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3.insteadof=https://github.com/uber/h3
url./Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3.insteadof=https://github.com/uber/h3.git
```

**Step 5: Resolve (no cache clearing needed):**

The `insteadOf` redirect works at the Git level, so SPM picks it up on the next resolve without needing to clear caches:

```bash
# rm -rf ~/Library/Caches/org.swift.swiftpm
# rm -rf ~/Library/Developer/Xcode/DerivedData/*/SourcePackages

cd /path/to/PhotoBooks
xcodebuild -resolvePackageDependencies -scmProvider system
```

This should be nearly instant since both the main repo and its 62 MB submodule are now served from local disk.

**To undo all redirects:**

```bash
git config --global --unset-all url."/Users/gavinxiang/Downloads/swift-h3".insteadOf
git config --global --unset-all url."/Users/gavinxiang/Downloads/swift-h3/Sources/CH3/h3".insteadOf
# Optionally revert the file protocol allow (only if you no longer need any local redirects)
git config --global --unset protocol.file.allow
```

### Option C: Use a `file://` URL in the mirror

Some SPM versions handle `file://` URLs better than bare paths, since SPM recognizes `file://` as a valid URL scheme:

```bash
swift package config set-mirror \
  --original "https://github.com/JeremyEspresso/swift-h3" \
  --mirror "file:///Users/gavinxiang/Downloads/swift-h3"
```

This sometimes works where bare `/Users/...` paths don't. Not guaranteed across all SPM/Xcode versions.

### Comparison

| Method | Reliability | Handles submodules | Scope | Requires `-scmProvider system` |
|--------|-------------|-------------------|-------|-------------------------------|
| **Option B** (`insteadOf`) | **Confirmed working** | Yes (if you add rules for submodule URLs too) | Global Git config | Yes |
| **Option A** (drag into Xcode) | High | Yes (local copy used as-is) | Per-project, GUI only | No |
| **Option C** (`file://` URL) | Medium | No (submodules still fetch from remote) | Per-project mirror | Recommended |
| `set-mirror` with bare path | **Did not work** | No | Per-project mirror | Yes |

**Recommendation:** Use **Option B** (`git config insteadOf`) -- it's the only method confirmed to work end-to-end, including submodule redirects. Use **Option A** (drag into Xcode) as a simpler alternative for GUI-only development.

---

## 2. Use a proxy when the bottleneck is network path

If slowness is due to routing/firewall (e.g. to GitHub), a proxy in a better region can help. SPM uses Git for fetches, so configure Git:

```bash
git config --global http.proxy http://your-proxy:port
git config --global https.proxy https://your-proxy:port
```

**What is `-scmProvider`?**

`-scmProvider` tells xcodebuild **which Git implementation** to use for Swift Package Manager operations (clone, fetch, checkout):

- **SCM** = Source Control Management (here, Git). SPM needs Git to download package repos.
- **Two choices:** Xcode ships its own built-in Git, and your Mac has the **system** Git (e.g. from Xcode Command Line Tools or Homebrew). They behave differently:
  - **`xcode`** (default) -- Xcode's built-in Git. Does **not** read your `git config` (e.g. `http.proxy`, `url.<base>.insteadOf`). No proxy, no custom remotes. Good when you don't need any of that.
  - **`system`** -- The system `git` binary. **Does** read `~/.gitconfig` and repo-level `git config`. Use this when you rely on proxy, SSH, or other Git settings so that SPM's fetches (and submodule fetches) go through your proxy or custom URLs.

The option is **per run**: it only affects that `xcodebuild` invocation. There is no global "current provider"; the default (when you omit the flag) is always `xcode`. The Xcode GUI does not expose this; it uses its built-in SCM. So for proxy or custom Git behavior, run resolve from the command line with `-scmProvider system`.

When building with Xcode, force use of system Git so it respects this:

```bash
# Run from the directory that contains your .xcodeproj, .xcworkspace, or Package.swift
cd /path/to/your/project
xcodebuild -resolvePackageDependencies -scmProvider system
```

If you're not in the project directory, specify the project or workspace:

```bash
xcodebuild -project YourApp.xcodeproj -resolvePackageDependencies -scmProvider system
# or
xcodebuild -workspace YourApp.xcworkspace -resolvePackageDependencies -scmProvider system
```

To use the default again, omit `-scmProvider` or pass `-scmProvider xcode`:

```bash
xcodebuild -resolvePackageDependencies
```

**`-scmProvider` options** (which implementation to use for Git operations):

| Value    | Description            |
|----------|------------------------|
| `system` | Use system Git (respects `git config`, e.g. proxy) |
| `xcode`  | Use Xcode's built-in Git (default when omitted)    |

**Check which SCM provider is used**

- `-scmProvider` is **per run** -- there is no global "current" setting. If your command includes `-scmProvider system`, that run uses system Git; if you omit it or use `-scmProvider xcode`, that run uses Xcode's built-in SCM.
- To see the default (built-in SCM) preference:
  ```bash
  defaults read com.apple.Xcode IDEPackageSupportUseBuiltinSCM
  ```
  - **"domain/default pair ... does not exist"** -- key is unset, so Xcode uses the **default (built-in SCM)**.
  - `1` or `YES` -- built-in SCM.
  - `0` or `NO` -- may use system SCM in some versions; to be sure, pass `-scmProvider system` on the command.

In Xcode: **File -> Packages -> Reset Package Caches**, then resolve again. For full reliability with proxies, using `swift package resolve` and `xcodebuild ... -scmProvider system` from the command line is more predictable than the GUI alone.

---

## 3. Batch mirror setup

For many dependencies, you can automate mirror setup:

- **[Mirror-Package](https://github.com/sbeitzel/Mirror-Package)** -- CLI to set mirrors for multiple packages.
- **SPMTools** -- can help with SPM usage and (in some setups) faster downloads via terminal proxy.

---

## 4. Reduce how often resolution runs

- **Cache**: After a successful resolve, SPM caches the graph; avoid "Reset Package Caches" unless needed.
- **Pins**: Use **File -> Packages -> Resolve Package Versions** once, then rely on the resolved versions so full resolution isn't triggered every time.
- **CI**: In CI, cache the SPM cache/dir (e.g. `~/Library/Caches/org.swift.swiftpm`, build folder) so you don't re-resolve and re-download every run.

---

## 5. Regional mirrors (e.g. China)

- Use a **Gitee (or similar) mirror** of the same repo and set that as the mirror URL for the GitHub dependency (see section 1). Community discussions (e.g. [Swift Forums -- Gitee acceleration](https://forums.swift.org/t/swift-package-manager-is-based-on-the-new-gitee-image-acceleration-scheme-acceleration-service-for-chinese-users/56676)) mention this for Chinese users.
- Or run a **small Git mirror/cache** (e.g. on a server with good GitHub access) and point SPM to that via `set-mirror`.

---

## Summary

| Strategy | Status | Use case |
|----------|--------|----------|
| **`insteadOf` (Git config)** | **Confirmed working** | Redirect Git URLs (+ submodule URLs) to local paths; use with `-scmProvider system` |
| **Local override (drag into Xcode)** | Works | Use a local clone during development (GUI only) |
| **Proxy** | Works | Better route to GitHub; configure Git proxy + `-scmProvider system` for Xcode |
| **Cache / pins** | Works | Fewer full resolves; cache in CI |
| **Regional mirror** | Works | Use Gitee or similar when GitHub is slow in your region |
| **`set-mirror` (SPM mirroring)** | **Did not work** | Intended for URL-to-URL remapping; local paths and submodules are unreliable |
