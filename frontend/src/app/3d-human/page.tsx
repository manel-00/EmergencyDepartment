import BioDigitalViewer from "@/components/BioDigitalViewer";

export default function ThreeDHumanPage() {
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-3xl font-bold mb-4">Interactive 3D Human Body</h1>
      <BioDigitalViewer />
    </div>
  );
}
