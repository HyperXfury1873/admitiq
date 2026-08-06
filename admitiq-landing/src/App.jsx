import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Tutorial from "./pages/Tutorial.jsx";
import UseCases from "./pages/UseCases.jsx";
import GettingStarted from "./pages/GettingStarted.jsx";
import PythonPage from "./pages/Python.jsx";
import JavaScriptPage from "./pages/JavaScript.jsx";
import Security from "./pages/Security.jsx";
import ForAgents from "./pages/ForAgents.jsx";
import Compare from "./pages/Compare.jsx";
import Faq from "./pages/Faq.jsx";
import About from "./pages/About.jsx";
import Privacy from "./pages/Privacy.jsx";
import WhyAdmitiq from "./pages/WhyAdmitiq.jsx";
import SecureQrGuide from "./pages/guides/SecureQrGuide.jsx";
import SingleUseQrGuide from "./pages/guides/SingleUseQrGuide.jsx";
import ExpiringTicketsGuide from "./pages/guides/ExpiringTicketsGuide.jsx";
import TokenDebugger from "./pages/TokenDebugger.jsx";
import HostedApi from "./pages/HostedApi.jsx";
import Pricing from "./pages/Pricing.jsx";
import CloudSecurity from "./pages/CloudSecurity.jsx";
import TermsCloud from "./pages/TermsCloud.jsx";
import CloudPrivacy from "./pages/CloudPrivacy.jsx";
import DpaSubprocessors from "./pages/DpaSubprocessors.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="why" element={<WhyAdmitiq />} />
            <Route path="about" element={<About />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="tutorial" element={<Tutorial />} />
            <Route path="debugger" element={<TokenDebugger />} />
            <Route path="hosted-api" element={<HostedApi />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="cloud-security" element={<CloudSecurity />} />
            <Route path="terms-cloud" element={<TermsCloud />} />
            <Route path="cloud-privacy" element={<CloudPrivacy />} />
            <Route path="dpa-subprocessors" element={<DpaSubprocessors />} />
            <Route path="use-cases" element={<UseCases />} />
            <Route path="getting-started" element={<GettingStarted />} />
            <Route path="python" element={<PythonPage />} />
            <Route path="javascript" element={<JavaScriptPage />} />
            <Route path="security" element={<Security />} />
            <Route path="for-agents" element={<ForAgents />} />
            <Route path="compare" element={<Compare />} />
            <Route path="faq" element={<Faq />} />
            <Route path="guides/secure-qr-codes" element={<SecureQrGuide />} />
            <Route path="guides/single-use-qr" element={<SingleUseQrGuide />} />
            <Route path="guides/expiring-tickets" element={<ExpiringTicketsGuide />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
