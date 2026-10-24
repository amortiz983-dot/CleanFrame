# Handoff: install CleanFrame on Drew's Samsung UN70NU6900

You are continuing a setup that a cloud Claude Code session started. That session could not reach the TV.
You are running locally on Drew's Mac, so you can reach the TV over the LAN. Work through one stage at a time,
tell Drew what you're about to do before any action that touches the TV, and confirm what appears on screen with Drew.

## Already done

- **TV:** Samsung **UN70NU6900** (2018 NU6900 series, US). The firmware string starts `T-KTSUAKUC`. This is **Tizen 4.0**.
  It is **not** a Frame TV, so it has no Art Mode.
- **Mac:** Apple Silicon (`arm64`), git 2.54, Node v22.20, Python 3.14.
- **Repo:** `~/CleanFrame-tv` on branch `tizen4-un70nu6900` of `amortiz983-dot/CleanFrame`, a fork of `nthnclrk/CleanFrame`.
  This branch adapts the app for Tizen 4.0:
  - `required_version="4.0"`
  - `inset` expanded to top/right/bottom/left
  - a flex `gap` fallback (`app/assets/flexgap*.{js,css}`)
  - Art Mode hidden
  
  `npm run check` and `npm run check:browser` pass (344/344).
  Read `INSTALL-UN70NU6900.md`, but **ignore its Tizen Studio instructions**. Tizen Studio is deprecated, so don't install it.
- **Built:** `npm run export:public` produced `dist/CleanFrame-public-unsigned.wgt`. It is unzipped into `build/`
  (`config.xml`, `index.html`, `main.js`, `assets/`…).
- **App identity** in `build/config.xml`: package `nClrkHome1`, app ID `nClrkHome1.FrameHome`. Keep it unless Drew asks to change it.
  If it does change, also update `SELF` in `app/device.js`.
- **Tools:** Drew is installing VS Code and the "Visual Studio Code Extension for Tizen", which brings in the Baseline SDK
  (Tizen-Core, Package Manager, Certificate Manager, Device Manager, the `tizen` CLI and `sdb`). Ask Drew which SDK path they chose.
  If the tools aren't installed yet, finish that first.
  Samsung's "Tizen Agent Skills" can also install and drive the SDK. Use them if they're available.

## Remaining stages

1. **Tools check.** Find `sdb` and `tizen` under the SDK path and add them to `PATH` in `~/.zshrc`.
   Make sure the Samsung certificate extension (the TV / Samsung certificate profile type) is available.
2. **TV IP.** Ask Drew for it. It's at **Settings → General → Network → Network Status → IP Settings**.
   Work out the Mac's LAN IP yourself (it's on the active interface, not a VPN).
3. **Developer Mode.** Guide Drew through it:
   - On the TV, go to **Home → Apps**.
   - Type **12345** with the remote. The **123** button opens the number pad.
   - Set Developer mode **On** and enter the Mac's IP as Host PC IP.
   - Unplug the TV for 10 seconds, then plug it back in.
4. **Connect.** Run `sdb connect <TV_IP>:26101`, then `sdb devices`, then `sdb capability`.
   Record `platform_version` (expect 4.0) and `cpu_arch`. Read the installed-app list.
   If the connection is refused, recheck the IPs and Developer Mode, and do a full unplug.
5. **Certificate.** Create a **Samsung** TV profile (not a plain Tizen one) with an author certificate and a distributor certificate.
   Use the **Public** privilege, and get the DUID by selecting the connected TV.
   Drew signs in to their Samsung account and types every password themselves. Never collect those.
   Back up the author certificate.
6. **Sign and install.** Run `tizen package -t wgt -s <profile> -- build/`, then `tizen install -n CleanFrame.wgt -t <device> -- build/`,
   and confirm the app appears in the installed list.
   If the install only uploads the file, try `sdb shell 0 vd_appinstall nClrkHome1.FrameHome <uploaded path>`.
   Then run `tizen run -p nClrkHome1.FrameHome -t <device>` and ask Drew what's on screen.
7. **Afterwards.**
   - Ask Drew which installed apps they want as shortcuts. The defaults are the original author's Australian apps, so change them
     through CleanFrame's Settings → Home apps. Code changes go in `app/main.js` (the HOME list) and `app/device.js` (IDS).
   - Suggest pinning CleanFrame on the Smart Hub bar, and turning on **Settings → General → Smart Features → Autorun Last App**.
   - Note anything that looks wrong on the real TV: font weights, spacing, animation smoothness.

## Boundaries

- **Don't** use `scripts/native-home/` or `scripts/tv.py`. They target the original author's Tizen 9 Frame setup.
  The Home button can't be reassigned on this TV.
- **Don't** factory-reset, change firmware, open the service menu, root the TV, or set up router port forwarding.
- Keep certificates, passwords and the TV's DUID and serial number **out of git**. `.local/` and `dist/` are already gitignored.
- If you change code, re-run `python3 scripts/build-flexgap-compat.py` after any change to `app/style.css`.
  Run `npm run check` before rebuilding with `npm run export:public`, then re-unzip into `build/`.
  Commit to `tizen4-un70nu6900` and push to `origin`.
