import UIKit
import WebKit
import Capacitor

class PrimalViewController: CAPBridgeViewController {

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        // Allow inline media playback (needed for background video autoplay)
        configuration.allowsInlineMediaPlayback = true

        // Allow media playback without user gesture (autoplay muted video)
        configuration.mediaTypesRequiringUserActionForPlayback = []

        // Allow getUserMedia for camera/mic in WKWebView (LiveKit, Daily.co)
        if #available(iOS 14.5, *) {
            configuration.preferences.isElementFullscreenEnabled = true
        }

        // Allow AirPlay
        configuration.allowsAirPlayForMediaPlayback = true

        return super.webView(with: frame, configuration: configuration)
    }

    // Grant camera/mic permission requests from WKWebView without re-prompting
    // The native iOS permission dialog fires from getUserMedia — this just tells
    // WKWebView to allow the request after iOS has already granted it.
    @available(iOS 15.0, *)
    override func webView(
        _ webView: WKWebView,
        requestMediaCapturePermissionFor origin: WKSecurityOrigin,
        initiatedByFrame frame: WKFrameInfo,
        type: WKMediaCaptureType,
        decisionHandler: @escaping (WKPermissionDecision) -> Void
    ) {
        // Auto-grant for our own domain
        if origin.host == "primalgay.com" || origin.host.hasSuffix(".primalgay.com") {
            decisionHandler(.grant)
            return
        }

        // Auto-grant for Daily.co iframe
        if origin.host.hasSuffix(".daily.co") {
            decisionHandler(.grant)
            return
        }

        // Auto-grant for LiveKit
        if origin.host.hasSuffix(".livekit.cloud") {
            decisionHandler(.grant)
            return
        }

        // Prompt for unknown origins
        decisionHandler(.prompt)
    }
}
