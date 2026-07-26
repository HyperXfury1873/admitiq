import Seo from "../components/Seo.jsx";
import PageHero from "../components/PageHero.jsx";
import { TokenInspector } from "../components/TokenInspector.jsx";

export default function TokenDebugger() {
  return (
    <>
      <Seo
        title="Token debugger — decode AdmitiQ tokens like jwt.io"
        description="Paste an AdmitiQ token and inspect header, payload, and signature locally. Same three-part shape as JWT; decode never leaves your browser."
        path="/debugger"
        keywords="AdmitiQ token debugger, decode AdmitiQ token, jwt.io alternative QR token, header payload signature"
      />
      <PageHero
        kicker="Debugger"
        title="Inspect an AdmitiQ token"
        subtitle="Same idea as jwt.io: color-coded header · payload · signature. Decoding runs entirely in your browser — nothing is sent to LogicLitz."
      />
      <section className="aq-section aq-debugger-section">
        <TokenInspector showPaste className="aq-debugger-inspector" />
      </section>
    </>
  );
}
