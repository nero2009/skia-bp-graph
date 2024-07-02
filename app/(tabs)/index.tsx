import {
	Dimensions,
	LayoutChangeEvent,
	View,
	Text as RNTEXT,
} from 'react-native';

import {
	Canvas,
	Circle,
	DataSourceParam,
	Group,
	Rect,
	Text,
	useFont,
} from '@shopify/react-native-skia';
import React from 'react';

const mycolors = {
	serious: '#EA228F',
	high: '#FFC643',
	good: '#1DC9B7',
	low: '#B1DEFF',
};

const xAxisTickers = [40, 50, 60, 70, 80, 90, 100, 110];
const yAxisTickers = [70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180];
const GUTTER = 2;
const canvasHeight = 300;
const canvasWidth = Dimensions.get('window').width;

const bloodPressureZones = [
	{ xMin: 0, xMax: 3, yMin: 0, yMax: 1, color: mycolors.low },
	{ xMin: 0, xMax: 7, yMin: 0, yMax: 4, color: mycolors.good },
	{ xMin: 0, xMax: 9, yMin: 0, yMax: 6, color: mycolors.high },
	{ xMin: 0, xMax: 16, yMin: 0, yMax: 12, color: mycolors.serious },
];

const axisBoundaries = {
	x: [0, 16],
	y: [0, 12],
};

export default function HomeScreen() {
	const zones = [
		{ xMin: 0, xMax: 3, yMin: 0, yMax: 1, color: mycolors.low },
		{ xMin: 0, xMax: 7, yMin: 0, yMax: 4, color: mycolors.good },
		{ xMin: 0, xMax: 9, yMin: 0, yMax: 6, color: mycolors.high },
		{ xMin: 0, xMax: 16, yMin: 0, yMax: 12, color: mycolors.serious },
	];

	return (
		<View style={{ flex: 1, width: '100%' }}>
			<RNTEXT style={{ fontSize: 32, marginBottom: 200 }}>
				Bllod pressure
			</RNTEXT>

			<View style={{ height: 350, borderWidth: 3, width: '100%' }}>
				<BloodPressureGraph
					bloodPressureZones={zones}
					boundary={{
						x: [0, 16],
						y: [0, 12],
					}}
					containerHeight={300}
					containerWidth={Dimensions.get('window').width}
					gutter={2}
					tickerInsets={{
						x: 32,
						y: 40,
					}}
					xTicker={[40, 50, 60, 70, 80, 90, 100, 110]}
					yTicker={[70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180]}
					xTickerInterval={2}
					diaReading={80}
					sysReading={140}
					fontPath={require('../../assets/fonts/SpaceMono-Regular.ttf')}
					fontSize={10}
				/>
			</View>
		</View>
	);
}

interface BloodPressureGraphProps {
	xTicker: number[];
	yTicker: number[];
	boundary: {
		x: [number, number];
		y: [number, number];
	};
	gutter: number;
	containerHeight: number;
	containerWidth: number;
	bloodPressureZones: {
		xMin: number;
		xMax: number;
		yMin: number;
		yMax: number;
		color: string;
	}[];
	xTickerInterval: number;
	tickerInsets: {
		x: number;
		y: number;
	};
	diaReading: number;
	sysReading: number;
	fontSize: number;
	fontPath: DataSourceParam;
}

const translateShim = 0;
const xInsets = 40;
const translateShim2 = 0;

const BloodPressureGraph = ({
	bloodPressureZones,
	boundary,
	containerHeight,
	containerWidth,
	gutter,
	xTicker,
	yTicker,
	xTickerInterval,
	tickerInsets,
	diaReading,
	sysReading,
	fontPath,
	fontSize,
}: BloodPressureGraphProps) => {
	const [size, setSize] = React.useState({ width: 0, height: 0 });
	const [hasMeasuredLayoutSize, setHasMeasuredLayoutSize] =
		React.useState(false);

	const font = useFont(fontPath, fontSize);

	const width = size.width;
	const height = size.height;
	const centerX = width / 2;
	const centerY = height / 2;

	const origin = {
		x: centerX - centerX + tickerInsets.x,
		y: centerY + centerY - tickerInsets.y,
		width: size.width - tickerInsets.x,
		height: size.height - tickerInsets.y,
	};

	const rectangleLength = origin.height / boundary.y[1];
	const rectangleWidth = origin.width / boundary.x[1];

	const getColor = (xaxis: number, yaxis: number) => {
		// return color
		for (let zone of bloodPressureZones) {
			if (
				zone.xMin <= xaxis &&
				xaxis <= zone.xMax &&
				zone.yMin <= yaxis &&
				yaxis <= zone.yMax
			) {
				return zone.color;
			}
		}
		return 'red';
	};

	const xAxisTicker = xTicker.map((value, index) => {
		return (
			<>
				<Text
					text={String(value)}
					x={origin.x + index * xTickerInterval * rectangleWidth - gutter}
					y={origin.y + tickerInsets.y}
					color={'black'}
					font={font}
				/>
			</>
		);
	});

	const yAxisTicker = yTicker.map((value, index) => {
		return (
			<>
				<Text
					text={String(value)}
					x={origin.x - tickerInsets.x}
					y={
						origin.y +
						translateShim2 +
						gutter * yTicker.length -
						rectangleLength * index
					}
					color={'black'}
					font={font}
				/>
			</>
		);
	});

	const normalizer = (value: number, axis: 'x' | 'y') => {
		const totalLength =
			boundary.y[1] * rectangleLength + GUTTER * (boundary.y[1] - 1);
		const totalWidth = boundary.x[1] * rectangleWidth;
		const oneUnitLength = totalLength / boundary.y[1];
		const oneUnitWidth = totalWidth / boundary.x[1];
		const onePixelLength = oneUnitLength / 10; // 10 is the number of intervals in the y axis for each rectangle
		const onePixelWidth = oneUnitWidth / 5; // 5 is the number of intervals in the x axis for each rectangle

		if (axis === 'x') {
			return (value - xTicker[0]) * onePixelWidth;
		} else {
			return (value - yTicker[0]) * onePixelLength;
		}
	};

	const onLayout = React.useCallback(
		({ nativeEvent: { layout } }: LayoutChangeEvent) => {
			setHasMeasuredLayoutSize(true);
			setSize(layout);
		},
		[]
	);

	return (
		<Canvas style={{ flex: 1 }} onLayout={onLayout}>
			{hasMeasuredLayoutSize ? (
				<>
					{xAxisTicker}
					{yAxisTicker}
					<Group>
						{[...Array(boundary.y[1])].map((iny, i) =>
							[...Array(boundary.x[1])].map((inx, j) => {
								return (
									<Group
										color={getColor(j, i)}
										style={'fill'}
										key={`${j}-${i}`}
									>
										<Rect
											x={origin.x + rectangleWidth * j}
											y={origin.y - rectangleLength * i}
											width={rectangleWidth}
											height={rectangleLength}
											color={'white'}
										/>
										<Rect
											x={origin.x + rectangleWidth * j}
											y={origin.y - rectangleLength * i}
											width={rectangleWidth - gutter}
											height={rectangleLength - gutter}
										/>
									</Group>
								);
							})
						)}
						<Group color={'white'}>
							<Circle
								cx={origin.x + normalizer(diaReading, 'x')}
								cy={origin.y - normalizer(sysReading, 'y') + rectangleLength}
								r={20 / 2}
							/>
							<Circle
								cx={origin.x + normalizer(diaReading, 'x')}
								cy={origin.y - normalizer(sysReading, 'y') + rectangleLength}
								r={8 / 2}
								color='#EA228F'
							/>
						</Group>
					</Group>
				</>
			) : null}
		</Canvas>
	);
};
