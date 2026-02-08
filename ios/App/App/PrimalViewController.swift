import UIKit
import WebKit
import Capacitor

class PrimalViewController: CAPBridgeViewController {

    // Grant camera/mic permission requests from WKWebView without re-prompting
    @available(iOS 15.0, *)
    func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        if origin.host == "primalgay.com" || origin.host.hasSuffix(".primalgay.com") ||
           origin.host.hasSuffix(".daily.co") || origin.host.hasSuffix(".livekit.cloud") {
            decisionHandler(.grant)
            return
        }
        decisionHandler(.prompt)
    }
}
