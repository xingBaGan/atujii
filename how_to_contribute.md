# How to develop

## Install dependencies

at the root directory
run install.bat on windows
run install.sh on linux
run install.command on macos

node version: 20.15.0
nrm use taobao

clone submodule

```bash
git submodule update --init --recursive
```

```bash
cd comfyui_client
git submodule update --remote
npm install
npm run build
```

## Install dependencies

at the root directory
```bash
npm install
```

## Run

at the root directory
```bash
npm run electron:dev
```

## Build

at the root directory
```bash
npm run electron:build
```

