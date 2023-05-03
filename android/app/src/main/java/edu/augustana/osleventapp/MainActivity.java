package edu.augustana.osleventapp;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactActivityDelegate;
import android.os.Bundle;
import com.zoontek.rnbootsplash.RNBootSplash; // <- react-native-bootsplash import


public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this); // <- initialize the splash screen
    super.onCreate(savedInstanceState); // or super.onCreate(null) with react-native-screens
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
    protected String getMainComponentName() {
      return "OSLEventApp";
  }
}
