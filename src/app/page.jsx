// Developed by Arshia Afshani
import AIFeaturesSection from "../components/intro";
import Header from "../components/header";
import Footer from "../components/footer";
import BottomNav from "../components/bottomNav";
export default function Home() {
  return (
    <div className="w-full">
      <Header />
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <AIFeaturesSection></AIFeaturesSection>
        <Footer></Footer>
      </main>
    </div>
  );
}