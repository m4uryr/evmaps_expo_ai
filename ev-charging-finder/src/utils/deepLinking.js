import { Linking, Platform } from 'react-native';

// Operator app schemes and store links
const OPERATOR_APPS = {
  'Enel X Way': {
    ios: {
      scheme: 'enelxway://',
      appStore: 'https://apps.apple.com/app/enel-x-way/id1504526498',
    },
    android: {
      scheme: 'com.enelxway.app',
      playStore: 'https://play.google.com/store/apps/details?id=com.enel.x.evmobile',
    },
    web: 'https://www.enelxway.com',
  },
  'EnelX': {
    ios: {
      scheme: 'enelxway://',
      appStore: 'https://apps.apple.com/app/enel-x-way/id1504526498',
    },
    android: {
      scheme: 'com.enelxway.app',
      playStore: 'https://play.google.com/store/apps/details?id=com.enel.x.evmobile',
    },
    web: 'https://www.enelx.com',
  },
  'Tesla Supercharger': {
    ios: {
      scheme: 'tesla://',
      appStore: 'https://apps.apple.com/app/tesla/id582007913',
    },
    android: {
      scheme: 'com.teslamotors.tesla',
      playStore: 'https://play.google.com/store/apps/details?id=com.teslamotors.tesla',
    },
    web: 'https://www.tesla.com/supercharger',
  },
  'IONITY': {
    ios: {
      scheme: 'ionity://',
      appStore: 'https://apps.apple.com/app/ionity/id1435106178',
    },
    android: {
      scheme: 'com.ionity.app',
      playStore: 'https://play.google.com/store/apps/details?id=com.2getthere.ionityapp',
    },
    web: 'https://ionity.eu',
  },
  'Be Charge': {
    ios: {
      scheme: 'becharge://',
      appStore: 'https://apps.apple.com/app/be-charge/id1460176503',
    },
    android: {
      scheme: 'it.becharge.mobile',
      playStore: 'https://play.google.com/store/apps/details?id=it.becharge.mobile',
    },
    web: 'https://www.becharge.com',
  },
  'A2A E-Moving': {
    ios: {
      scheme: 'a2aemoving://',
      appStore: 'https://apps.apple.com/app/e-moving/id1438841834',
    },
    android: {
      scheme: 'it.a2a.emoving',
      playStore: 'https://play.google.com/store/apps/details?id=it.a2a.emoving',
    },
    web: 'https://www.a2aemoving.it',
  },
  'Free To X': {
    ios: {
      scheme: 'freetox://',
      appStore: 'https://apps.apple.com/app/free-to-x/id1576639049',
    },
    android: {
      scheme: 'it.autostrade.freetox',
      playStore: 'https://play.google.com/store/apps/details?id=it.autostrade.freetox',
    },
    web: 'https://www.freetox.it',
  },
  'Neogy': {
    ios: {
      scheme: 'neogy://',
      appStore: 'https://apps.apple.com/app/neogy/id1477649156',
    },
    android: {
      scheme: 'it.neogy.app',
      playStore: 'https://play.google.com/store/apps/details?id=it.neogy.app',
    },
    web: 'https://www.neogy.it',
  },
  'Atlante': {
    ios: {
      scheme: 'atlante://',
      appStore: 'https://apps.apple.com/app/atlante/id1602925313',
    },
    android: {
      scheme: 'com.atlanteenergy.app',
      playStore: 'https://play.google.com/store/apps/details?id=com.atlanteenergy.app',
    },
    web: 'https://www.atlanteenergy.com',
  },
  'Electra': {
    ios: {
      scheme: 'electra://',
      appStore: 'https://apps.apple.com/app/electra-charge/id1517532738',
    },
    android: {
      scheme: 'com.electra.charge',
      playStore: 'https://play.google.com/store/apps/details?id=com.electra.charge',
    },
    web: 'https://www.go-electra.com',
  },
  'Repower': {
    ios: {
      scheme: 'repower://',
      appStore: 'https://apps.apple.com/app/repower-e-mobility/id1461583395',
    },
    android: {
      scheme: 'com.repower.emobility',
      playStore: 'https://play.google.com/store/apps/details?id=com.repower.emobility',
    },
    web: 'https://www.repower.com',
  },
  'Ewiva': {
    ios: {
      scheme: 'ewiva://',
      appStore: 'https://apps.apple.com/app/ewiva/id6443965193',
    },
    android: {
      scheme: 'it.ewiva.app',
      playStore: 'https://play.google.com/store/apps/details?id=it.ewiva.app',
    },
    web: 'https://www.ewiva.it',
  },
  'Powy': {
    ios: {
      scheme: 'powy://',
      appStore: 'https://apps.apple.com/app/powy/id1536306992',
    },
    android: {
      scheme: 'it.powy.app',
      playStore: 'https://play.google.com/store/apps/details?id=it.powy.app',
    },
    web: 'https://www.powy.it',
  },
  'EVDC': {
    ios: {
      scheme: 'evdc://',
      appStore: 'https://apps.apple.com/app/evdc/id1489850738',
    },
    android: {
      scheme: 'eu.evdc.app',
      playStore: 'https://play.google.com/store/apps/details?id=eu.evdc.app',
    },
    web: 'https://www.evdc.eu',
  },
  'Electrip': {
    ios: {
      scheme: 'electrip://',
      appStore: 'https://apps.apple.com/app/electrip/id1505477982',
    },
    android: {
      scheme: 'eu.electrip.app',
      playStore: 'https://play.google.com/store/apps/details?id=eu.electrip.app',
    },
    web: 'https://www.electrip.eu',
  },
  'Electroverse': {
    ios: {
      scheme: 'electroverse://',
      appStore: 'https://apps.apple.com/app/electroverse/id1574440116',
    },
    android: {
      scheme: 'energy.octopus.electroverse',
      playStore: 'https://play.google.com/store/apps/details?id=energy.octopus.electroverse',
    },
    web: 'https://electroverse.octopus.energy',
  },
};

// Open operator app or fallback to store/website
export const openOperatorApp = async (operatorName, stationId, stationLat, stationLng) => {
  const operator = OPERATOR_APPS[operatorName];
  
  if (!operator) {
    // Fallback to website search for unknown operators
    const searchQuery = encodeURIComponent(`${operatorName} EV charging app`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    await Linking.openURL(searchUrl);
    return;
  }

  const platformConfig = Platform.OS === 'ios' ? operator.ios : operator.android;
  
  try {
    // Try to open the app with station coordinates for deep linking
    let appUrl = platformConfig.scheme;
    
    // Some apps support deep linking to specific locations
    if (stationLat && stationLng) {
      // Generic location parameter attempt
      appUrl = `${platformConfig.scheme}?lat=${stationLat}&lng=${stationLng}`;
      if (stationId) {
        appUrl = `${platformConfig.scheme}?stationId=${stationId}&lat=${stationLat}&lng=${stationLng}`;
      }
    }

    const canOpen = await Linking.canOpenURL(platformConfig.scheme);
    
    if (canOpen) {
      await Linking.openURL(appUrl);
    } else {
      // App not installed, open store
      const storeUrl = Platform.OS === 'ios' ? platformConfig.appStore : platformConfig.playStore;
      await Linking.openURL(storeUrl);
    }
  } catch (error) {
    console.error('Error opening operator app:', error);
    // Fallback to website
    if (operator.web) {
      await Linking.openURL(operator.web);
    }
  }
};
