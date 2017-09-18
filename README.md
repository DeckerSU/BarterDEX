![alt text](https://github.com/buildog/BarterDEX/raw/master/resources/github/logoWithPunchline.png)

## Electron (Node.js)

#### Quick start

```
git clone git@github.com:buildog/BarterDEX.git
cd BarterDEX
npm install
npm start
```

#### Development Commands list

| command  | task performed  |
|:-----------| -----------|
| `npm start`   | run the built application (`/dist`) |
| `npm run dev` | start dev (webpack will hot-reload the JavaScript and CSS) |
| `npm run dist` | generate a new build to `/dist` :shipit: 🎉 |
| `npm run release` | build a new package release for all plateform |


## Apps
**wip**.

## Package release

[electron-packager](https://github.com/electron-userland/electron-packager) is used generate the packages. You can create a release for all plateform via `npm run release` or platform specific via `npm run [package-mac | package-linux | package-win]`

## Updates

auto-updater will be available soon


## Known issues and workaround

### Your camera is busy :collision: :movie_camera:
On OSX you can release it with  
```
sudo killall VDCAssistant AppleCameraAssistant
```


## Built With
[React](https://facebook.github.io/react/) |
[Mobx](https://github.com/mobxjs/mobx) |
[Webpack](https://webpack.github.io/)  |
[Electron](https://github.com/electron/electron)  |
[PostCSS](https://github.com/postcss/postcss)  | **and a lot of 😍**


## Contributing
The best way to contribute is by looking at the [issues](https://github.com/buildog/BarterDEX/issues) in this repo.  

## License and disclamer
This repository is licensed under the GNU General Public License v3.0, also included in our repository in the [COPYING](https://github.com/buildog/BarterDEX/blob/master/COPYING) file.
