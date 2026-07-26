import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
	FadeInDown,
	useSharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import { StockItem, ProductType } from "@/types";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { LowStockBadge } from "./InventoryLowStockBadge";

interface InventoryListItemProps {
	item: StockItem;
	colors: ReturnType<typeof COLORS.themed>;
	index?: number;
}

const PRODUCT_COLORS: Record<ProductType, string> = {
	A: COLORS.productA,
	GNY: COLORS.productGNY,
	C: COLORS.productC,
	K: COLORS.productK,
};

const PRODUCT_LABELS: Record<ProductType, string> = {
	A: "Avena",
	GNY: "Galletas",
	C: "Cookies",
	K: "Ketos",
};

export function InventoryListItem({
	item,
	colors,
	index = 0,
}: InventoryListItemProps) {
	const isLowStock = item.quantity <= item.minThreshold;
	const productColor = PRODUCT_COLORS[item.type];
	const productLabel = PRODUCT_LABELS[item.type];

	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 50)
				.springify()
				.damping(15)}
			style={[
				styles.container,
				{ backgroundColor: colors.white, borderColor: colors.border },
				animatedStyle,
			]}
			accessibilityRole="summary"
		>
			<View
				style={[styles.typeBadge, { backgroundColor: productColor }]}
				accessibilityLabel={`Product type ${productLabel}`}
			>
				<Text style={styles.typeBadgeText}>{item.type}</Text>
			</View>

			<View style={styles.info}>
				<Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
					{item.name}
				</Text>
				<View style={styles.metaRow}>
					<Text style={[styles.productLabel, { color: productColor }]}>
						{productLabel}
					</Text>
					<Text style={[styles.quantity, { color: colors.textLight }]}>
						Qty: {item.quantity}
					</Text>
					<Text style={[styles.price, { color: colors.textLight }]}>
						${item.price}
					</Text>
					{isLowStock && (
						<LowStockBadge
							quantity={item.quantity}
							minThreshold={item.minThreshold}
						/>
					)}
				</View>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: SIZES.padding,
		borderRadius: SIZES.radius,
		borderBottomWidth: 1,
		marginBottom: 8,
	},
	typeBadge: {
		width: 44,
		height: 44,
		borderRadius: SIZES.radius,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	typeBadgeText: {
		...FONTS.h3,
		color: COLORS.white,
		fontWeight: "700",
	},
	info: {
		flex: 1,
	},
	name: {
		...FONTS.body1,
		fontWeight: "600",
		marginBottom: 4,
	},
	metaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flexWrap: "wrap",
	},
	productLabel: {
		...FONTS.body3,
		fontWeight: "600",
	},
	quantity: {
		...FONTS.body3,
	},
	price: {
		...FONTS.body3,
	},
});
