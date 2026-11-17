package pk.ledger.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        if (getBridge() != null && getBridge().getWebView() != null) {
            cm.setAcceptThirdPartyCookies(getBridge().getWebView(), false);
        }
    }

    // Android keeps WebView cookies in memory for a while. Writing them to disk whenever the app
    // goes to the background means the "stay signed in" cookie survives the app being closed or killed.
    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        CookieManager.getInstance().flush();
    }
}
