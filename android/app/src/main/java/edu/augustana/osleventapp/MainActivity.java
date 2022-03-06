package edu.augustana.osleventapp;

import com.facebook.react.ReactActivity;

import com.facebook.react.ReactActivityDelegate; // <- react-native-bootsplash import
import com.zoontek.rnbootsplash.RNBootSplash; // <- react-native-bootsplash import


public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    @Override
      protected void loadApp(String appKey) {
        RNBootSplash.init(MainActivity.this); // <- initialize the splash screen
        super.loadApp(appKey);
      }
  }
}
