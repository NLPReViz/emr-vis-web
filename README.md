# emr-vis-web 

![Screenshot](https://github.com/trivedigaurav/emr-vis-web/raw/master/screenshot.png)

emr-vis-web is the web port for the [emr-vis-nlp](https://github.com/trivedigaurav/emr-vis-nlp) project.

## Getting Started

To get started, install the pre-requisites and then clone emr-vis-web as described below:

### Prerequisites

1. You need git to clone the emr-vis-web repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

2. You must have node.js and its package manager (npm) installed. You can download them from [http://nodejs.org/](http://nodejs.org/) or get them using your favourite package manager. For example, if you are on a Mac and have homebrew installed, run `$ brew install node`.

3. We use the [Apache Tomcat](http://tomcat.apache.org/) server to deploy the app. On a Mac with homebrew you may use `$ brew install tomcat` to get it.

### Clone emr-vis-web

1. Navigate to the home directory of your tomcat server. You can use `$ catalina version` to find `$CATALINA_HOME`.
2. `cd` to the _webapps/_ directory. If you are using the default tomcat setup, your present working directory would be something like _/usr/local/Cellar/tomcat/7.0.54/libexec/webapps/_.
3. Clone the emr-vis-web repository using [git][git]:

    ```
    git clone https://github.com/trivedigaurav/emr-vis-web.git
    cd emr-vis-web
    ```

### Install Dependencies

Make sure you have [node.js][node] installed.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].

We have preconfigured `npm` to automatically run `bower` so we can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files


### Run the Application

If you haven't built the backend project as yet, please do so now.

Now browse to the app at `http://localhost:8080/emr-vis-web/app/index.html` or `<your-localhost-root>/emr-vis-web/app`.


[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server
