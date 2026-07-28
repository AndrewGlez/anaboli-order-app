import React, { useState, useEffect, useMemo } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Modal,
	ScrollView,
} from "react-native";
import Animated, {
	FadeInRight,
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import {
	Wheat,
	Cookie,
	WheatOff,
	Check,
	ChevronLeft,
	ChevronRight,
} from "lucide-react-native";
import { ProductType } from "@/types";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import {
	FLAVOR_CODES,
	FlavorCode,
	FLAVOR_COLORS,
} from "@/constants/productionCatalog";

interface InventoryFormProps {
	visible: boolean;
	onClose: () => void;
	onSave: (data: {
		name: string;
		type: ProductType;
		quantity: number;
		minThreshold: number;
		price: number;
		reason?: string;
	}) => void;
	initialData?: {
		name: string;
		type: ProductType;
		quantity: number;
		minThreshold: number;
		price: number;
	};
}

const PRODUCT_TYPES: {
	type: ProductType;
	label: string;
	color: string;
	Icon: typeof Wheat;
}[] = [
	{ type: "A", label: "Avena", color: COLORS.productA, Icon: Wheat },
	{ type: "GNY", label: "Galletas", color: COLORS.productGNY, Icon: Cookie },
	{ type: "C", label: "Cookies", color: COLORS.productC, Icon: Cookie },
	{ type: "K", label: "Ketos", color: COLORS.productK, Icon: WheatOff },
];

function parseNameForEdit(
	name: string,
): { type: ProductType; flavor: FlavorCode | null } | null {
	const [typePart, flavorPart] = name.split(" - ");
	if (!typePart || !flavorPart) return null;
	const validTypes: ProductType[] = ["A", "GNY", "C", "K"];
	if (!validTypes.includes(typePart as ProductType)) return null;
	if (!FLAVOR_CODES.includes(flavorPart as FlavorCode)) return null;
	return { type: typePart as ProductType, flavor: flavorPart as FlavorCode };
}

function clearError(errors: Record<string, string>, key: string) {
	const n = { ...errors };
	delete n[key];
	return n;
}

export function InventoryForm({
	visible,
	onClose,
	onSave,
	initialData,
}: InventoryFormProps) {
	const { theme } = useThemeStore();
	const colors = COLORS.themed(theme);
	const isEdit = !!initialData;

	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [selectedType, setSelectedType] = useState<ProductType>("A");
	const [selectedFlavor, setSelectedFlavor] = useState<FlavorCode | null>(null);
	const [quantity, setQuantity] = useState("0");
	const [minThreshold, setMinThreshold] = useState("0");
	const [price, setPrice] = useState("0");
	const [reason, setReason] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (!visible) return;
		if (initialData) {
			const parsed = parseNameForEdit(initialData.name);
			setSelectedType(parsed?.type ?? initialData.type);
			setSelectedFlavor(parsed?.flavor ?? null);
			setQuantity(initialData.quantity?.toString() ?? "0");
			setMinThreshold(initialData.minThreshold?.toString() ?? "0");
			setPrice(initialData.price?.toString() ?? "0");
			setReason("");
		} else {
			setStep(1);
			setSelectedType("A");
			setSelectedFlavor(null);
			setQuantity("0");
			setMinThreshold("0");
			setPrice("0");
			setReason("");
		}
		setErrors({});
	}, [visible, initialData]);

	const modalScale = useSharedValue(0.82);
	const overlayOpacity = useSharedValue(0);
	useEffect(() => {
		if (!visible) return;
		modalScale.value = withSpring(1, { damping: 18, stiffness: 220 });
		overlayOpacity.value = withTiming(1, { duration: 180 });
	}, [visible, modalScale, overlayOpacity]);

	const modalAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: modalScale.value }],
	}));
	const overlayAnimatedStyle = useAnimatedStyle(() => ({
		opacity: overlayOpacity.value,
	}));

	const generatedName = useMemo(() => {
		if (!selectedFlavor) return "";
		return `${selectedType} - ${selectedFlavor}`;
	}, [selectedType, selectedFlavor]);

	const validateStep = (s: number): boolean => {
		const e: Record<string, string> = {};
		if (s === 1 && !selectedType) e.type = "Seleccioná un tipo";
		if (s === 2 && !selectedFlavor) e.flavor = "Seleccioná un sabor";
		if (s === 3) {
			const q = parseInt(quantity, 10),
				m = parseInt(minThreshold, 10),
				p = parseFloat(price);
			if (isNaN(q) || q < 0) e.quantity = "Cantidad inválida";
			if (isNaN(m) || m < 0) e.minThreshold = "Stock mínimo inválido";
			if (isNaN(p) || p < 0) e.price = "Precio inválido";
			if (isEdit && !reason.trim()) e.reason = "La razón es requerida";
		}
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const goNext = () => {
		if (step < 3 && validateStep(step)) {
			setStep((step + 1) as 1 | 2 | 3);
			setErrors({});
		} else if (step === 3) handleSave();
	};
	const goBack = () => {
		if (step > 1) {
			setStep((step - 1) as 1 | 2 | 3);
			setErrors({});
		}
	};

	const handleSave = () => {
		if (!validateStep(3)) return;
		onSave({
			name: generatedName,
			type: selectedType,
			quantity: parseInt(quantity, 10),
			minThreshold: parseInt(minThreshold, 10),
			price: parseFloat(price),
			...(isEdit && reason ? { reason } : {}),
		});
		onClose();
	};

	const handleCancel = () => {
		setStep(1);
		setSelectedType("A");
		setSelectedFlavor(null);
		setQuantity("0");
		setMinThreshold("0");
		setPrice("0");
		setReason("");
		setErrors({});
		onClose();
	};

	const inputStyle = (hasError: boolean) => [
		styles.input,
		{
			backgroundColor: colors.white,
			borderColor: hasError ? colors.error : colors.border,
			color: colors.text,
		},
	];

	return (
		<Modal visible={visible} animationType="none" transparent>
			<Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
				<Animated.View
					style={[
						styles.container,
						{ backgroundColor: colors.white, borderColor: colors.border },
						modalAnimatedStyle,
					]}
				>
					{/* Progress bar */}
					<View
						style={[styles.progressTrack, { backgroundColor: colors.border }]}
					>
						<Animated.View
							style={[
								styles.progressFill,
								{
									backgroundColor: colors.primary,
									width: `${(step / 3) * 100}%`,
								},
							]}
						/>
					</View>

					<Text style={[styles.title, { color: colors.text }]}>
						{isEdit ? "Editar Item" : "Agregar Item"}
					</Text>

					<ScrollView
						style={styles.stepContainer}
						contentContainerStyle={styles.stepContent}
					>
						{step === 1 && (
							<Animated.View key="s1" entering={FadeInRight.duration(250)}>
								<Text style={[styles.stepLabel, { color: colors.textLight }]}>
									Tipo de producto
								</Text>
								<View style={styles.typeGrid}>
									{PRODUCT_TYPES.map((p) => {
										const sel = selectedType === p.type;
										return (
											<TouchableOpacity
												key={p.type}
												style={[
													styles.typeCard,
													{
														borderColor: sel ? p.color : colors.border,
														backgroundColor: sel
															? p.color + "15"
															: "transparent",
                          transform: [{ scale: 1 }],
													},
												]}
												onPress={() => {
													setSelectedType(p.type);
													setErrors(clearError(errors, "type"));
												}}
											>
												{sel && (
													<View
														style={[
															styles.checkBadge,
															{ backgroundColor: p.color },
														]}
													>
														<Check size={14} color="#fff" />
													</View>
												)}
												<p.Icon
													size={48}
													color={sel ? p.color : colors.textLight}
												/>
												<Text
													style={[
														styles.typeCardLabel,
														{ color: sel ? p.color : colors.textLight },
													]}
												>
													{p.type}
												</Text>
												<Text
													style={[
														styles.typeCardSub,
														{ color: sel ? p.color : colors.textLight },
													]}
												>
													{p.label}
												</Text>
											</TouchableOpacity>
										);
									})}
								</View>
								{errors.type && (
									<Text style={[styles.error, { color: colors.error }]}>
										{errors.type}
									</Text>
								)}
							</Animated.View>
						)}

						{step === 2 && (
							<Animated.View key="s2" entering={FadeInRight.duration(250)}>
								<Text style={[styles.stepLabel, { color: colors.textLight }]}>
									Seleccioná un sabor
								</Text>
								<View style={styles.flavorGrid}>
									{FLAVOR_CODES.map((flavor) => {
										const sel = selectedFlavor === flavor;
										const fc = FLAVOR_COLORS[flavor];
										return (
											<TouchableOpacity
												key={flavor}
												style={[
													styles.flavorCard,
													{
														borderColor: sel ? fc : colors.border,
														backgroundColor: sel ? fc + "20" : colors.surface,
													},
												]}
												onPress={() => {
													setSelectedFlavor(flavor);
													setErrors(clearError(errors, "flavor"));
												}}
											>
												<View
													style={[styles.flavorDot, { backgroundColor: fc }]}
												/>
												<Text
													style={[
														styles.flavorText,
														{ color: sel ? fc : colors.text },
													]}
													numberOfLines={2}
												>
													{flavor}
												</Text>
												{sel && (
													<Check
														size={16}
														color={fc}
														style={styles.flavorCheck}
													/>
												)}
											</TouchableOpacity>
										);
									})}
								</View>
								{errors.flavor && (
									<Text style={[styles.error, { color: colors.error }]}>
										{errors.flavor}
									</Text>
								)}
							</Animated.View>
						)}

						{step === 3 && (
							<Animated.View key="s3" entering={FadeInRight.duration(250)}>
								<Text style={[styles.stepLabel, { color: colors.textLight }]}>
									Stock y precio
								</Text>
								<Text style={[styles.previewName, { color: colors.text }]}>
									{generatedName}
								</Text>

								{[
									{
										label: "Cantidad",
										value: quantity,
										set: setQuantity,
										key: "quantity",
									},
									{
										label: "Stock mínimo",
										value: minThreshold,
										set: setMinThreshold,
										key: "minThreshold",
									},
									{
										label: "Precio",
										value: price,
										set: setPrice,
										key: "price",
									},
								].map(({ label, value, set, key }) => (
									<View key={key}>
										<Text style={[styles.label, { color: colors.text }]}>
											{label}
										</Text>
										<TextInput
											style={inputStyle(!!errors[key])}
											value={value}
											onChangeText={(t) => {
												set(t);
												setErrors(clearError(errors, key));
											}}
											keyboardType="numeric"
											placeholder="0"
											placeholderTextColor={colors.textLight}
										/>
										{errors[key] && (
											<Text style={[styles.error, { color: colors.error }]}>
												{errors[key]}
											</Text>
										)}
									</View>
								))}

								{isEdit && (
									<>
										<Text style={[styles.label, { color: colors.text }]}>
											Razón (requerido)
										</Text>
										<TextInput
											style={inputStyle(!!errors.reason)}
											value={reason}
											onChangeText={(t) => {
												setReason(t);
												setErrors(clearError(errors, "reason"));
											}}
											placeholder="Razón del cambio"
											placeholderTextColor={colors.textLight}
										/>
										{errors.reason && (
											<Text style={[styles.error, { color: colors.error }]}>
												{errors.reason}
											</Text>
										)}
									</>
								)}
							</Animated.View>
						)}
					</ScrollView>

					{/* Navigation */}
					<View style={styles.buttons}>
						<TouchableOpacity
							style={[styles.btnOutline, { borderColor: colors.border }]}
							onPress={handleCancel}
						>
							<Text
								style={[styles.btnOutlineText, { color: colors.textLight }]}
							>
								Cancelar
							</Text>
						</TouchableOpacity>
						{step > 1 && (
							<TouchableOpacity
								style={[styles.btnOutline, { borderColor: colors.border }]}
								onPress={goBack}
							>
								<ChevronLeft size={16} color={colors.textLight} />
								<Text
									style={[styles.btnOutlineText, { color: colors.textLight }]}
								>
									Atrás
								</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity
							style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
							onPress={goNext}
						>
							<Text style={styles.btnPrimaryText}>
								{step === 3 ? "Guardar" : "Siguiente"}
							</Text>
							{step < 3 && <ChevronRight size={16} color="#fff" />}
						</TouchableOpacity>
					</View>
				</Animated.View>
			</Animated.View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	container: {
		borderRadius: SIZES.radius * 2,
		padding: SIZES.padding + 4,
		width: "90%",
		maxWidth: 420,
		borderWidth: 1,
		maxHeight: "85%",
	},
	progressTrack: {
		height: 3,
		borderRadius: 2,
		marginBottom: 12,
		overflow: "hidden",
	},
	progressFill: { height: "100%", borderRadius: 2 },
	title: { ...FONTS.h2, marginBottom: 4 },
	stepContainer: { maxHeight: 360 },
	stepContent: { paddingBottom: 8 },
	stepLabel: { ...FONTS.body3, marginBottom: 12 },
	// Type cards
	typeGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		rowGap: 10,
	},
	typeCard: {
		width: "48%",
		aspectRatio: 1,
		borderWidth: 2,
		borderRadius: SIZES.radius * 1.5,
		justifyContent: "center",
		alignItems: "center",
		padding: 6,
	},
	checkBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		width: 22,
		height: 22,
		borderRadius: 11,
		justifyContent: "center",
		alignItems: "center",
	},
	typeCardLabel: { ...FONTS.h3, marginTop: 6 },
	typeCardSub: { ...FONTS.body3, marginTop: 2 },
	// Flavor grid
	flavorGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		rowGap: 8,
	},
	flavorCard: {
		width: "31%",
		aspectRatio: 1,
		borderWidth: 1.5,
		borderRadius: SIZES.radius,
		justifyContent: "center",
		alignItems: "center",
		padding: 4,
	},
	flavorDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 4 },
	flavorText: { ...FONTS.body3, fontWeight: "500", textAlign: "center" },
	flavorCheck: { position: "absolute", top: 4, right: 4 },
	// Step 3
	previewName: { ...FONTS.h3, marginBottom: 16 },
	label: { ...FONTS.body2, fontWeight: "600", marginBottom: 4, marginTop: 10 },
	input: {
		borderWidth: 1,
		borderRadius: SIZES.radius,
		padding: 12,
		...FONTS.body1,
	},
	error: { ...FONTS.body3, marginTop: 4 },
	// Buttons
	buttons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 16,
	},
	btnOutline: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: SIZES.radius,
		borderWidth: 1,
	},
	btnOutlineText: { ...FONTS.body2, fontWeight: "600" },
	btnPrimary: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: SIZES.radius,
	},
	btnPrimaryText: { color: COLORS.white, ...FONTS.body2, fontWeight: "600" },
});
