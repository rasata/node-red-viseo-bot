/**
 * Copyright 2013, 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// The `https` setting requires the `fs` module. Uncomment the following
// to make it available:
//var fs = require("fs");

const extend = require("extend");
const path = require("path");
const fs = require("fs");
const dextend = require("deep-extend");

const defaultUsers = [
  {
    username: "demo",
    password: "$2a$08$dxKDMZrgCSSJuiKW2gxZoeas6AjmWi5oV1GM4pXis9z8p54p4/Xiq",
    permissions: "*"
  }
];

let config = { admin: { users: defaultUsers } };

try {
  config = require(process.env.CONFIG_PATH)[process.env.NODE_ENV] || {
    admin: { users: defaultUsers }
  };
} catch (e) {
  console.log("no project config file found");
}

const enableProjects = (process.env.ENABLE_PROJECTS || "true") === "true"; //projects enabled by default

let defaultSettings = {
  storageModule: require("node-red-viseo-storage-plugin"),
  credentialSecret: process.env.CREDENTIAL_SECRET,
  httpNodeMiddleware: require(process.env.NODE_RED_HTTP_MIDDLEWARE ||
    "node-red-viseo-middleware")(),
  projectsDir: path.join(process.env.FRAMEWORK_ROOT, "../projects"),
  settingsDir: process.env.ROOT_DIR
};

if (fs.existsSync(process.env.BOT_ROOT)) {
  defaultSettings.userDir = path.normalize(process.env.BOT_ROOT + "/data/");
  process.chdir(process.env.BOT_ROOT);
} else {
  defaultSettings.userDir = path.normalize(process.env.ROOT_DIR + "/data/");
}

const splitCredentialFiles =
  (process.env.CREDENTIAL_SPLIT_FILES || "true") === "true"; //credentials splitted by default
if (enableProjects === false && splitCredentialFiles) {
  //if projects disabled, then file path is defined in package.json
  defaultSettings.credentialsFile =
    "flows_cred_" + process.env.NODE_ENV + ".json";
}

defaultSettings = extend(defaultSettings, true, {
  // the tcp port that the Node-RED web server is listening on
  uiPort: process.env.PORT || 1880,

  // By default, the Node-RED UI accepts connections on all IPv4 interfaces.
  // The following property can be used to listen on a specific interface. For
  // example, the following would only allow connections from the local machine.
  //uiHost: "127.0.0.1",

  // Retry time in milliseconds for MQTT connections
  mqttReconnectTime: 15000,

  // Retry time in milliseconds for Serial port connections
  serialReconnectTime: 15000,

  // Retry time in milliseconds for TCP socket connections
  //socketReconnectTime: 10000,

  // Timeout in milliseconds for TCP server socket connections
  //  defaults to no timeout
  //socketTimeout: 120000,

  // Timeout in milliseconds for HTTP request connections
  //  defaults to 120 seconds
  //httpRequestTimeout: 120000,

  // The maximum length, in characters, of any message sent to the debug sidebar tab
  debugMaxLength: 1000,

  // The maximum number of messages nodes will buffer internally as part of their
  // operation. This applies across a range of nodes that operate on message sequences.
  //  defaults to no limit. A value of 0 also means no limit is applied.
  //nodeMaxMessageBufferLength: 0,

  // To disable the option for using local files for storing keys and certificates in the TLS configuration
  //  node, set this to true
  //tlsConfigDisableLocalFiles: true,

  // Colourise the console output of the debug node
  debugUseColors: true,

  // The file containing the flows. If not set, it defaults to flows_<hostname>.json
  flowFile: "flows.json",

  // To enabled pretty-printing of the flow within the flow file, set the following
  //  property to true:
  flowFilePretty: true,

  // By default, credentials are encrypted in storage using a generated key. To
  // specify your own secret, set the following property.
  // If you want to disable encryption of credentials, set this property to false.
  // Note: once you set this property, do not change it - doing so will prevent
  // node-red from being able to decrypt your existing credentials and they will be
  // lost.
  //credentialSecret: "a-secret-key",

  // By default, all user data is stored in the Node-RED install directory. To
  // use a different location, the following property can be used
  //userDir: "",

  // Node-RED scans the `nodes` directory in the install directory to find nodes.
  // The following property can be used to specify an additional directory to scan.
  //nodesDir: path.resolve(process.env.BOT_ROOT, 'data/node_modules'),

  // By default, the Node-RED UI is available at http://localhost:1880/
  // The following property can be used to specifiy a different root path.
  // If set to false, this is disabled.
  httpAdminRoot: process.env.NODE_RED_ROUTE || "/",

  // Some nodes, such as HTTP In, can be used to listen for incoming http requests.
  // By default, these are served relative to '/'. The following property
  // can be used to specifiy a different root path. If set to false, this is
  // disabled.
  //httpNodeRoot: '/red-nodes',

  // The following property can be used in place of 'httpAdminRoot' and 'httpNodeRoot',
  // to apply the same root to both parts.
  //httpRoot: '/red',

  // When httpAdminRoot is used to move the UI to a different root path, the
  // following property can be used to identify a directory of static content
  // that should be served at http://localhost:1880/.
  httpStatic: path.normalize(process.env.BOT_ROOT + "/webapp"),

  // The maximum size of HTTP request that will be accepted by the runtime api.
  // Default: 5mb
  //apiMaxLength: '5mb',

  // If you installed the optional node-red-dashboard you can set it's path
  // relative to httpRoot
  //ui: { path: "ui" },

  // Securing Node-RED
  // -----------------
  // To password protect the Node-RED editor and admin API, the following
  // property can be used. See http://nodered.org/docs/security.html for details.

  adminAuth: {
    type: "credentials",
    users: config.admin.users || []
  },

  // To password protect the node-defined HTTP endpoints (httpNodeRoot), or
  // the static content (httpStatic), the following properties can be used.
  // The pass field is a bcrypt hash of the password.
  // See http://nodered.org/docs/security.html#generating-the-password-hash
  //httpNodeAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},
  //httpStaticAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},

  // The following property can be used to enable HTTPS
  // See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
  // for details on its contents.
  // See the comment at the top of this file on how to load the `fs` module used by
  // this setting.
  //
  //https: {
  //    key: fs.readFileSync('privatekey.pem'),
  //    cert: fs.readFileSync('certificate.pem')
  //},

  // The following property can be used to cause insecure HTTP connections to
  // be redirected to HTTPS.
  //requireHttps: true

  // The following property can be used to disable the editor. The admin API
  // is not affected by this option. To disable both the editor and the admin
  // API, use either the httpRoot or httpAdminRoot properties
  disableEditor: (process.env.NODE_RED_DISABLE_EDITOR || false) === "true",

  // The following property can be used to configure cross-origin resource sharing
  // in the HTTP nodes.
  // See https://github.com/troygoode/node-cors#configuration-options for
  // details on its contents. The following is a basic permissive set of options:
  //httpNodeCors: {
  //    origin: "*",
  //    methods: "GET,PUT,POST,DELETE"
  //},

  // If you need to set an http proxy please set an environment variable
  // called http_proxy (or HTTP_PROXY) outside of Node-RED in the operating system.
  // For example - http_proxy=http://myproxy.com:8080
  // (Setting it here will have no effect)
  // You may also specify no_proxy (or NO_PROXY) to supply a comma separated
  // list of domains to not proxy, eg - no_proxy=.acme.co,.acme.co.uk

  // The following property can be used to add a custom middleware function
  // in front of all http in nodes. This allows custom authentication to be
  // applied to all http in nodes, or any other sort of common request processing.
  //httpNodeMiddleware: function(req,res,next) {
  //    // Handle/reject the request, or pass it on to the http in node by calling next();
  //    // Optionally skip our rawBodyParser by setting this to true;
  //    //req.skipRawBodyParser = true;
  //    next();
  //},

  // The following property can be used to verify websocket connection attempts.
  // This allows, for example, the HTTP request headers to be checked to ensure
  // they include valid authentication information.
  //webSocketNodeVerifyClient: function(info) {
  //    // 'info' has three properties:
  //    //   - origin : the value in the Origin header
  //    //   - req : the HTTP request
  //    //   - secure : true if req.connection.authorized or req.connection.encrypted is set
  //    //
  //    // The function should return true if the connection should be accepted, false otherwise.
  //    //
  //    // Alternatively, if this function is defined to accept a second argument, callback,
  //    // it can be used to verify the client asynchronously.
  //    // The callback takes three arguments:
  //    //   - result : boolean, whether to accept the connection or not
  //    //   - code : if result is false, the HTTP error status to return
  //    //   - reason: if result is false, the HTTP reason string to return
  //},

  // Anything in this hash is globally available to all functions.
  // It is accessed as context.global.
  // eg:
  //    functionGlobalContext: { os:require('os') }
  // can be accessed in a function block as:
  //    context.global.os

  functionGlobalContext: {
    tzModule: require("moment-timezone"),
    xpathModule: require("xpath"),
    domModule: require("xmldom").DOMParser,
    uuidv1: require("uuid/v1"),
    uuidv4: require("uuid/v4"),
    uuidv5: require("uuid/v5"),
    CONFIG: require("node-red-viseo-helper").CONFIG
  },

  // The following property can be used to order the categories in the editor
  // palette. If a node's category is not in the list, the category will get
  // added to the end of the palette.
  // If not set, the following default order is used:
  paletteCategories: [
    "📻_channels",
    "⚙️_bot_factory",
    "🛠️_tools",
    "function",
    "input",
    "output",
    "💬_language",
    "🖐️_channels_helpers",
    "💾_data",
    "📊_logs",
    "🖼️_image",
    "🔉_audio",
    "🃏_miscellaneous"
  ],

  // Configure the logging output
  logging: {
    // Only console logging is currently supported
    console: {
      // Level of logging to be recorded. Options are:
      // fatal - only those errors which make the application unusable should be recorded
      // error - record errors which are deemed fatal for a particular request + fatal errors
      // warn - record problems which are non fatal + errors + fatal errors
      // info - record information about the general running of the application + warn + error + fatal errors
      // debug - record information which is more verbose than info + info + warn + error + fatal errors
      // trace - record very detailed logging + debug + info + warn + error + fatal errors
      level: process.env.NODE_ENV === "dev" ? "debug" : "info",
      // Whether or not to include metric events in the log output
      metrics: false,
      // Whether or not to include audit events in the log output
      audit: false
    }
  },

  // https://github.com/node-red/node-red/issues/610
  // https://github.com/node-red/node-red/wiki/Design%3A-Editor-Themes
  editorTheme: {
    palette: {
      catalogues: [
        "https://catalog.bot.viseo.io/" +
          require("../package.json").version +
          ".json"
      ]
    },
    projects: {
      enabled: enableProjects, // To enable the Projects feature, set this value to true
      createDefaultFromZip:
        "https://github.com/NGRP/viseo-bot-template/archive/v1.0.0.zip",
      packageDir: "data/",
      activeProject: process.env.BOT
    },
    page: {
      title:
        "VBM - " +
        (process.env.BOT
          ? process.env.BOT.replace(/[-_\.]/g, " ")
          : "welcome !"),
      favicon: path.normalize(
        process.env.FRAMEWORK_ROOT + "/theme/favicon.ico"
      ),
      css: path.normalize(
        process.env.FRAMEWORK_ROOT +
          (process.env.NODE_ENV == "prod"
            ? "/theme/viseo_prod.css"
            : "/theme/viseo.css")
      ),
      scripts: path.normalize(process.env.FRAMEWORK_ROOT + "/theme/viseo.js")
    },
    header: {
      title:
        (process.env.BOT
          ? process.env.BOT.replace(/[-_\.]/g, " ")
          : "welcome !") + (process.env.NODE_ENV == "prod" ? " [PROD]" : ""),
      image: path.normalize(
        process.env.FRAMEWORK_ROOT +
          "/theme/logo_" +
          (process.env.NODE_ENV === "prod" ? "prod" : "dev") +
          ".png"
      ),
      url: "https://bot.viseo.io"
    },

    deployButton: {
      type: "simple",
      label: "Save"
    },

    menu: {
      "menu-item-import-library": false,
      "menu-item-export-library": false,
      "menu-item-keyboard-shortcuts": false,
      "menu-item-help": {
        label: process.env.BOT
          ? process.env.BOT.replace(/[-_\.]/g, " ")
          : "welcome !",
        url: "https://bot.viseo.io"
      }
    },

    userMenu: true,

    login: {
      image: path.normalize(
        process.env.FRAMEWORK_ROOT + "/theme/viseo_login.png"
      )
    }
  },

  userMenu: true,

  login: {
    image: path.normalize(process.env.FRAMEWORK_ROOT + "/theme/viseo_login.png")
  }
});

let finalSettings = defaultSettings;
try {
  if (fs.existsSync(process.env.NODE_RED_CONFIG_PATH) === false) {
    console.log("Info: No override of Node-RED config found.");
  } else {
    const botSettings = require(process.env.NODE_RED_CONFIG_PATH);

    if (botSettings) {
      finalSettings = dextend(defaultSettings, botSettings);
    }
  }
} catch (e) {
  console.log(e);
}

module.exports = finalSettings;
