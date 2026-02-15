
import logo from "@/assets/logo.png";

interface UMLogoProps {
    size?: number;
    className?: string;
}

const UMLogo = ({ size = 40, className = "" }: UMLogoProps) => {
    return (
        <img
            src={logo}
            alt="uniMate Logo"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

export default UMLogo;
