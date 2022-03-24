// Constants
const _ = LodashGS.load();

// Global variables
var instancePool = {};
var services = {};
var settings = { 
  containerFile: undefined, 
  externalConfigs: undefined,
  appFolders: undefined,
  sessionAuth: undefined
};
var defaultSettings = {
  externalConfigs: {
    executionTimeout: 300000
  }
}

const Configurer = {
  openContainerFile: function() {
    if (!settings.containerFile) {
      const containerFileId = this.getProp('containerFileId');
      if (containerFileId) {
        settings.containerFile = SpreadsheetApp.openById(containerFileId);
      } else {
        settings.containerFile = SpreadsheetApp.getActiveSpreadsheet();
      }
      if (!settings.containerFile) {
        throw new ConfigurationException('This script must be bounded by a Master Sheet. ' 
          + 'Or you have to provide your own Master Sheet ID as parameter when initialize.');
      }
      Logger.log(`Opening master sheet [${settings.containerFile.getName()}] ...DONE`);
    }
    return settings.containerFile;
  },
  
  setProp: function(key, val) {
    const properties = PropertiesService.getUserProperties();
    if (!val) {
      properties.deleteProperty(key);
    } else {
      Logger.log(`Set ${key}=${val}`);
      properties.setProperty(key, val);
    }
  },

  getProp: function(key) {
    const properties = PropertiesService.getUserProperties();
    const propVal = properties.getProperty(key);
    return propVal;
  },

  initInstance: function(beanClass, instanceInitializerCallback) {
    if (!instancePool[beanClass]) {
      instancePool[beanClass] = instanceInitializerCallback();
    }
    return instancePool[beanClass];
  },

  sessionAuth: function(retrieveSessionAuthCallback) {
    if (!settings.sessionAuth) {
      if (services.authService) {
        settings.sessionAuth = services.authService.getUnusedRecentAuth();
      } else {
        settings.sessionAuth = retrieveSessionAuthCallback();
      }
      Logger.log(`Configure authentication [${settings.sessionAuth.Username}] ...DONE`);
    }
    return settings.sessionAuth;
  },

  constructTimeout: function(timout) {
    const configuredTimeout = settings.externalConfigs.executionTimeout;
    const defaultTimeout = defaultSettings.externalConfigs.executionTimeout;
    const value = new Date(new Date().getTime() + Number(timout || configuredTimeout || defaultTimeout));
    Logger.log(`[Timeout at] ` + value.toISOString());
    return value;
  },

  documentProps: function() {
    const containerFileId = this.getProp('containerFileId');
    if (containerFileId) { 
      return {
        scope: 'Script', containerFileId, 
        props: PropertiesService.getScriptProperties() 
      };
    }
    return { 
      scope: 'Document', containerFileId: this.openContainerFile().getId(), 
      props: PropertiesService.getDocumentProperties() 
    };
  }

}
