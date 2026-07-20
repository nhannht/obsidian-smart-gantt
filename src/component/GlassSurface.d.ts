import {CSSProperties, ReactElement, ReactNode} from "react";

declare const GlassSurface: (props: {
	children?: ReactNode
	width?: number | string
	height?: number | string
	borderRadius?: number
	borderWidth?: number
	brightness?: number
	opacity?: number
	blur?: number
	displace?: number
	backgroundOpacity?: number
	saturation?: number
	distortionScale?: number
	redOffset?: number
	greenOffset?: number
	blueOffset?: number
	xChannel?: string
	yChannel?: string
	mixBlendMode?: string
	className?: string
	style?: CSSProperties
}) => ReactElement;

export default GlassSurface;
