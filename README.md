# [QuickMirror.me](https://quickmirror.me/)

### Check yoself before you tech yoself

**A free online mirror that uses your webcam.** Open [quickmirror.me](https://quickmirror.me/) and instantly see how you look before your next Zoom, Google Meet, Teams, Slack, or FaceTime call. No sign-up, no install, and nothing is ever recorded.

[![QuickMirror.me: check how you look before your next call](./public/og-image.jpg)](https://quickmirror.me/)

## Features

- **One click:** the camera starts as soon as the page loads.
- **Mirrored or unmirrored:** flip the view to see exactly what everyone else on the call sees.
- **Any camera:** switch between built-in, USB, and external webcams. Your choice is remembered.
- **Fullscreen:** fill the screen for a quick lighting and framing check.
- **Phone friendly:** works in Safari and Chrome on iPhone, iPad, and Android, using the selfie camera.
- **Private:** everything runs in your browser. No servers, no recording, no tracking, no ads.

## Development

You'll need [Node.js](https://nodejs.org/) 20.19 or newer.

```bash
npm install
npm run dev      # start a dev server at http://localhost:5173
npm test         # run the tests
npm run build    # production build in ./build
npm run preview  # serve the production build locally
```

Camera access only works on `https://` or `localhost`, so open the dev server via `localhost` (not your LAN IP) when testing in a browser.

### How it works

QuickMirror is a tiny [React](https://react.dev/) app built with [Vite](https://vite.dev/). It asks the browser for a camera stream with [`getUserMedia`](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia) and plays it in a `<video>` element, flipped with CSS when mirrored. That's it.

| File | What it does |
| --- | --- |
| [`src/App.jsx`](src/App.jsx) | Starts the camera, handles errors, and renders the controls |
| [`src/DeviceDrop.jsx`](src/DeviceDrop.jsx) | The camera picker |
| [`index.html`](index.html) | SEO metadata, structured data, and the About/FAQ content (readable without JavaScript) |
| [`public/`](public) | Icons, social image, `robots.txt`, `sitemap.xml`, `llms.txt`, and the web app manifest |

### Deployment

The site is hosted on [AWS Amplify Hosting](https://aws.amazon.com/amplify/hosting/), which builds and deploys every push to `main` using [`amplify.yml`](amplify.yml).

## Contributing

Bug reports and pull requests are welcome. Please [open an issue](https://github.com/GantMan/quickmirrorme/issues) if something doesn't work with your browser or camera.

## License

[MIT](LICENSE) © [Gant Laborde](https://gantlaborde.com) & [Infinite Red](https://infinite.red/)
