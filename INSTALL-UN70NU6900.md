# Installing CleanFrame on a Samsung UN70NU6900 (2018, Tizen 4.0)

This branch (`tizen4-un70nu6900`) adapts CleanFrame, which was built for a 2024 Frame TV running Tizen 9,
to the 2018 NU6900.

## What changed for this TV

| Change | Why |
| --- | --- |
| `config.xml` `required_version` 6.5 → **4.0** | The TV refuses to install a widget that asks for a newer Tizen version than it has. 2018 Samsung TVs run Tizen 4.0. |
| `inset:0` expanded to `top/right/bottom/left` | The Tizen 4.0 web engine is roughly Chromium 56. It ignores `inset`, which would collapse tiles and icons. |
| Flex `gap` fallback (`assets/flexgap*.{js,css}`, `scripts/build-flexgap-compat.py`) | Flex `gap` needs Chromium 84. The fallback only runs where `gap` is unsupported, and it turns the same spacing into margins. In Chromium it produced identical element positions to native `gap` across Home, Settings and All apps. |
| Art Mode button hidden (`FrameDevice.hasArt = false`) | The NU6900 isn't a Frame TV, so it has no Art Mode. |
| Browser test updated; `CLEANFRAME_CHROMIUM` env var in `scripts/browser.mjs` | The test now checks that Art Mode is hidden. The env var lets the tests use an existing Chromium. |

Checks run: `npm run check`, `npm run check:public` and `npm run check:browser` (344 passed, 0 failed).
**None of this has been tested on a real 2018 TV yet.** Look out for font weights: variable-font axes need Chromium 62,
so text may look lighter or heavier than in the preview. Also check how smooth the animation is on the older CPU.

The native Home-button takeover in `scripts/native-home/` is a .NET helper for Tizen 9. **Don't use it on this TV.**
After installation you open CleanFrame from Apps (see step 7).

## You need

- A Windows, Mac or Linux computer on the same Wi-Fi/LAN as the TV
- [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html).
  In its Package Manager, install **Extension SDK → Samsung TV Extensions** and **Samsung Certificate Extension**.
- A free Samsung account

## 1. Build the unsigned widget

```sh
git clone <your fork> CleanFrame && cd CleanFrame && git checkout tizen4-un70nu6900
npm ci
npm run export:public          # -> dist/CleanFrame-public-unsigned.wgt
mkdir build && cd build && unzip ../dist/CleanFrame-public-unsigned.wgt && cd ..
```

## 2. Find the TV's IP address

TV: **Settings → General → Network → Network Status → IP Settings**. Write down the IP address (`<TV_IP>`).
Also note your computer's LAN IP (`<PC_IP>`). Don't use a VPN address.

## 3. Turn on Developer Mode

1. On the TV, press **Home → Apps**.
2. On the Apps screen, enter **1 2 3 4 5** on the remote. On the Smart remote, press the **123** button to open the on-screen number pad.
3. Set Developer mode to **On**. Enter `<PC_IP>` as the Host PC IP, then choose **OK**.
4. Restart the TV fully: **unplug it for 10 seconds**, then plug it back in. A short power-button press often isn't enough.

## 4. Connect from the computer

```sh
sdb connect <TV_IP>:26101      # sdb is in tizen-studio/tools/
sdb devices                    # note the device name, e.g. UN70NU6900
sdb capability | grep -E "platform_version|cpu_arch"   # expect 4.0
```

You can also do this in Tizen Studio's **Device Manager**. Click **Remote Device Manager**, then **+**, add `<TV_IP>` and switch it on.

## 5. Create your certificate (once)

Tizen Studio → **Tools → Certificate Manager → + → Samsung → TV**. Name the profile (for example `MyTV`).
Create a new **author** certificate, then a **distributor** certificate with the **Public** privilege.
When it asks for the DUID, pick the connected TV from the list. Use that rather than typing an ID from the TV's menu.
Sign in with your Samsung account when it asks. Back up the author certificate, because future updates must be signed with the same one.

## 6. Sign, install and launch

```sh
tizen package -t wgt -s MyTV -- build/                       # writes build/CleanFrame.wgt
tizen install -n CleanFrame.wgt -t <device-name> -- build/
tizen run -p nClrkHome1.FrameHome -t <device-name>
```

If `install` only uploads the file and the app doesn't appear, run `sdb shell 0 vd_appinstall nClrkHome1.FrameHome /home/owner/share/tmp/sdk_tools/tmp/CleanFrame.wgt`.

## 7. Use it day to day

- CleanFrame now shows up in **Apps**. Move it to the start of the Home bar so it's one press away.
- **Settings → General → Smart Features → Autorun Last App: On** reopens CleanFrame at power-on if it was the last app you used.
- The default shortcuts follow the original author's Australian setup (ABC iview, SBS, Stremio). Open **Settings → Home apps** or **All apps** in CleanFrame to replace them with the apps on your TV.
- The remote's Home button still opens Samsung's Smart Hub. You can't change that on this TV.

## Undo

```sh
tizen uninstall -p nClrkHome1.FrameHome -t <device-name>
```

Then turn Developer Mode off in Apps (12345 again).
