import { ThemeProvider } from "./theme";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Gallery from "./components/Gallery";
import Install from "./components/Install";
import Footer from "./components/Footer";

export default function App() {
	return (
		<ThemeProvider>
			<div className="bg" aria-hidden="true" />
			<Nav />
			<main>
				<Hero />
				<Features />
				<Gallery />
				<Install />
			</main>
			<Footer />
		</ThemeProvider>
	);
}
