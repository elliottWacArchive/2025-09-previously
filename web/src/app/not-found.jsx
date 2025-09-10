import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <FuzzyText
                baseIntensity={0.08}
                hoverIntensity={0.5}
                enableHover={true}
            >
                404
            </FuzzyText>
            <FuzzyText
                baseIntensity={0.08}
                hoverIntensity={0.5}
                enableHover={true}
                fontSize="24px"
            >
                Oups ! Cette page n'existe pas.
            </FuzzyText>
        </div>
    );
}
