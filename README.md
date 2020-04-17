# ircnet.info

ircnet.info is a dynamic website that interacts with different APIs to provide the following services:

| Service       | API           |
| ------------- |:-------------:| 
| Server list   | InfoBot       |
| I:Line Lookup | InfoBot       | 
| Channel list  | Clis          | 

# Setup
Install NodeJS and Angular as described [here](https://angular.io/guide/setup-local).

Clone the git repository and type `npm install` to install all dependencies.

## Development
To start a development server type `ng serve` and navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build
Run `ng build --prod` to build the project. Copy the build artifacts of the `dist/` directory to your webserver. If you want to run the app in a subfolder, you must build with `--base-href /subfolder/`

