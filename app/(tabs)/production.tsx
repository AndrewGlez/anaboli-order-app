import React, { useState, useMemo, useRef, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Platform,
	type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Calendar,
	ClipboardList,
	Printer,
	Share2,
	Save,
	ChevronLeft,
	ChevronRight,
	Table2,
	Users,
} from "lucide-react-native";

import { FONTS, SIZES, type ColorSet } from "@/constants/theme";
import { useThemeStore } from "@/store/themeStore";
import { ReconciliationPanel } from "@/components/production/ReconciliationPanel";
import { useOrderStore } from "@/store/orderStore";
import { useProductionStore } from "@/store/productionStore";
import {
	FLAVOR_CODES,
	FLAVOR_COLORS,
	PRODUCTION_PRODUCT_TYPES,
} from "@/constants/productionCatalog";
import { PRODUCT_LABELS } from "@/components/production/mobileProductionLayout";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { canPrint, printReport } from "@/services/web/productionPrint";
import { canExport, exportReport } from "@/services/productionExport";
import Animated, { FadeInDown } from "react-native-reanimated";
import { toast } from "sonner";
import { VersionHistory } from "@/components/production/VersionHistory";
import { LegacyFixList } from "@/components/production/LegacyFixList";
import { DistributionSummary } from "@/components/production/DistributionSummary";
import { MobileProductionTable } from "@/components/production/MobileProductionTable";

import { VersionInfo } from "@/components/production/versionHistory";
import { selectDistributionSummary } from "@/services/productionSelectors";

export default function ProductionScreen() {
	const colors = useThemeStore((state) => state.resolvedColors);
	const breakpoint = useBreakpoint();
	const isMobile = breakpoint === "phone";
	const scrollViewRef = useRef<ScrollView>(null);

	// Store hooks
	const { orders, updateOrder } = useOrderStore();
	const productionStore = useProductionStore();

	// Local state
	const [selectedDate, setSelectedDate] = useState(() => {
		return new Date().toISOString().split("T")[0];
	});
	const [quantities, setQuantities] = useState<Map<string, number>>(() => {
		// Initialize with zeros
		const map = new Map<string, number>();
		FLAVOR_CODES.forEach((flavor) => {
			PRODUCTION_PRODUCT_TYPES.forEach((product) => {
				map.set(`${flavor}:${product}`, 0);
			});
		});
		return map;
	});
	// Rehydrate quantities when loading persisted reports or switching dates
	React.useEffect(() => {
		const entries = productionStore.selectEntriesForDate(selectedDate);
		const newQuantities = new Map<string, number>();

		// Initialize all entries to 0 first
		FLAVOR_CODES.forEach((flavor) => {
			PRODUCTION_PRODUCT_TYPES.forEach((product) => {
				newQuantities.set(`${flavor}:${product}`, 0);
			});
		});

		// Override with persisted values
		entries.forEach((entry) => {
			newQuantities.set(`${entry.flavor}:${entry.product}`, entry.quantity);
		});

		setQuantities(newQuantities);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDate]);

	// Get orders for selected date
	const ordersForDate = useMemo(() => {
		return orders.filter((order) => {
			const orderDate = order.createdAt.split("T")[0];
			return orderDate === selectedDate;
		});
	}, [orders, selectedDate]);

	// Get versions for the selected date
	const versionsForDate = useMemo(() => {
		const reports = productionStore.getVersionsForDate(selectedDate);
		return reports.map(
			(r): VersionInfo => ({
				version: r.version,
				createdAt: r.createdAt,
				date: r.date,
			}),
		);
	}, [productionStore, selectedDate]);

	// Calculate totals
	const { totalProduced, totalAssigned, isBalanced } = useMemo(() => {
		let produced = 0;
		quantities.forEach((qty) => {
			produced += qty;
		});

		let assigned = 0;
		ordersForDate.forEach((order) => {
			order.products.forEach((product) => {
				assigned += product.quantity;
			});
		});

		return {
			totalProduced: produced,
			totalAssigned: assigned,
			isBalanced: produced === assigned,
		};
	}, [quantities, ordersForDate]);

	// Distribution summary: aggregate assigned quantities per customer with share %.
	// Pure derivation over ordersForDate; does not touch store/reconciliation/history.
	const distributionSummary = useMemo(
		() => selectDistributionSummary(ordersForDate),
		[ordersForDate],
	);

	// Handle quantity change
	const handleQuantityChange = (
		flavor: string,
		product: string,
		value: string,
	) => {
		// Allow empty string during editing (user might be clearing input)
		if (value === "") {
			setQuantities((prev) => {
				const next = new Map(prev);
				next.set(`${flavor}:${product}`, 0);
				return next;
			});
			return;
		}

		const numValue = parseInt(value, 10);
		// Reject fractions and negative values
		if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
			return;
		}

		setQuantities((prev) => {
			const next = new Map(prev);
			next.set(`${flavor}:${product}`, numValue);
			return next;
		});
	};

	// Handle save
	const handleSave = async () => {
		// Check if viewing historical version - block save
		if (productionStore.isReadOnly) {
			const msg = "No puedes guardar cambios mientras ves una versión histórica.";
			if (Platform.OS === "web") {
				toast.error("Modo Sólo Lectura", { description: msg });
			} else {
				Alert.alert("Modo Sólo Lectura", msg);
			}
			return;
		}

		const result = productionStore.saveReport(selectedDate, quantities);
		if (result.ok) {
			if (Platform.OS === "web") {
				toast.success("Reporte guardado correctamente");
			} else {
				Alert.alert("Éxito", "Reporte guardado correctamente");
			}
		} else {
			if (Platform.OS === "web") {
				toast.error("Error al guardar", { description: result.reason });
			} else {
				Alert.alert("Error", result.reason);
			}
		}
	};

	// Handle print (web only)
	const handlePrint = () => {
		if (canPrint()) {
			printReport();
		}
	};

	// Handle export
	const handleExport = async () => {
		const report = productionStore.selectCurrentReport();
		if (!report) {
			Alert.alert("Error", "No hay reporte para exportar");
			return;
		}

		const result = await exportReport(report, ordersForDate);
		if (result.success) {
			Alert.alert("Éxito", result.message);
		} else {
			Alert.alert("Error", result.message);
		}
	};

	// Handle date navigation
	const changeDate = (days: number) => {
		const date = new Date(selectedDate);
		date.setDate(date.getDate() + days);
		const newDate = date.toISOString().split("T")[0];
		setSelectedDate(newDate);
		productionStore.setCurrentDate(newDate);
	};

	// Handle version selection
	const handleVersionSelect = useCallback(
		(version: number) => {
			productionStore.loadVersion(selectedDate, version);
			// Rehydrate quantities after loading version
			const entries = productionStore.selectEntriesForDate(selectedDate);
			const newQuantities = new Map<string, number>();
			FLAVOR_CODES.forEach((flavor) => {
				PRODUCTION_PRODUCT_TYPES.forEach((product) => {
					newQuantities.set(`${flavor}:${product}`, 0);
				});
			});
			entries.forEach((entry) => {
				newQuantities.set(`${entry.flavor}:${entry.product}`, entry.quantity);
			});
			setQuantities(newQuantities);
		},
		[productionStore, selectedDate],
	);

	// Handle fix legacy order
	const handleFixLegacyOrder = useCallback(
		(orderId: string) => {
			const order = orders.find((o) => o.id === orderId);
			if (!order) return;

			// Navigate to order list with fix mode
			// The fix action is handled via the OrderCard/OrderDetails components
			// which already have the onFix prop wired
			Alert.alert(
				"Corregir Sabor",
				`Selecciona un sabor válido para ${order.gymName}`,
				[
					{ text: "Cancelar", style: "cancel" },
					...FLAVOR_CODES.map((flavor) => ({
						text: flavor,
						onPress: () => {
							updateOrder(orderId, { flavor });
							Alert.alert("Éxito", "Sabor actualizado correctamente");
						},
					})),
				],
			);
		},
		[orders, updateOrder],
	);

	// Format date for display
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const webHeightStyle =
		Platform.OS === "web"
			? ({ height: "100vh", overflow: "hidden" } as unknown as ViewStyle)
			: null;

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: colors.background },
				webHeightStyle,
			]}
		>
			{/* Header */}
			<View style={[styles.header, { borderBottomColor: colors.border }]}>
				<View style={styles.titleRow}>
					<ClipboardList size={22} color={colors.primary} />
					<Text style={[styles.title, { color: colors.text }]}>
						Producción Diaria
					</Text>
				</View>
				<View style={styles.headerActions}>
					{canPrint() && (
						<TouchableOpacity
							style={[
								styles.iconButton,
								{ backgroundColor: colors.primary + "20" },
							]}
							onPress={handlePrint}
							accessibilityLabel="Imprimir"
						>
							<Printer size={20} color={colors.primary} />
						</TouchableOpacity>
					)}
					{canExport() && (
						<TouchableOpacity
							style={[
								styles.iconButton,
								{ backgroundColor: colors.primary + "20" },
							]}
							onPress={handleExport}
							accessibilityLabel="Exportar"
						>
							<Share2 size={20} color={colors.primary} />
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={[
							styles.iconButton,
							{
								backgroundColor: isBalanced ? colors.success : colors.error,
								opacity: isBalanced ? 1 : 0.7,
							},
						]}
						onPress={handleSave}
						disabled={!isBalanced || productionStore.isReadOnly}
						accessibilityLabel={
							productionStore.isReadOnly
								? "Modo solo lectura"
								: isBalanced
									? "Guardar reporte"
									: "Reconciliación pendiente"
						}
					>
						<Save size={20} color={colors.onPrimary} />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView
				ref={scrollViewRef}
				style={[styles.content, Platform.OS === "web" && styles.webContent]}
				contentContainerStyle={styles.contentContainer}
			>
				{/* Date Selector */}
				<Animated.View
					entering={FadeInDown.duration(300)}
					style={[styles.dateSelector, { backgroundColor: colors.white }]}
				>
					<TouchableOpacity
						style={styles.dateNavButton}
						onPress={() => changeDate(-1)}
						accessibilityLabel="Día anterior"
					>
						<ChevronLeft size={24} color={colors.primary} />
					</TouchableOpacity>

					<View style={styles.dateDisplay}>
						<Calendar
							size={20}
							color={colors.primary}
							style={styles.dateIcon}
						/>
						<Text style={[styles.dateText, { color: colors.text }]}>
							{formatDate(selectedDate)}
						</Text>
					</View>

					<TouchableOpacity
						style={styles.dateNavButton}
						onPress={() => changeDate(1)}
						accessibilityLabel="Día siguiente"
					>
						<ChevronRight size={24} color={colors.primary} />
					</TouchableOpacity>
				</Animated.View>

				{/* Reconciliation Panel */}
				<ReconciliationPanel
					totalProduced={totalProduced}
					totalAssigned={totalAssigned}
					colors={{
						background: colors.background,
						text: colors.text,
						textLight: colors.textLight,
						white: colors.white,
						border: colors.border,
						success: colors.success,
						error: colors.error,
					}}
				/>

				{/* Production Table */}
				{isMobile ? (
					<MobileProductionTable
						quantities={quantities}
						isReadOnly={productionStore.isReadOnly}
						onQuantityChange={handleQuantityChange}
						colors={{
							background: colors.background,
							text: colors.text,
							textLight: colors.textLight,
							border: colors.border,
							white: colors.white,
							primary: colors.primary,
						}}
					/>
				) : (
					<View style={[styles.section, { backgroundColor: colors.white }]}>
						<View style={styles.sectionTitleRow}>
							<Table2 size={22} color={colors.primary} />
							<Text style={[styles.sectionTitle, { color: colors.text }]}>
								Tabla de Producción
							</Text>
						</View>

						<View style={styles.tableContainer}>
							{/* Table Header */}
							<View
								style={[
									styles.tableHeader,
									{ backgroundColor: colors.background },
								]}
							>
								<Text
									style={[
										styles.tableHeaderCell,
										styles.flavorCell,
										{ color: colors.text },
									]}
								/>
								{PRODUCTION_PRODUCT_TYPES.map((product) => (
									<Text
										key={product}
										style={[
											styles.tableHeaderCell,
											styles.productCell,
											{ color: colors.text },
										]}
									>
										{product}
									</Text>
								))}
							</View>

							{/* Table Body */}
							{FLAVOR_CODES.map((flavor) => (
								<View
									key={flavor}
									style={[
										styles.tableRow,
										{ borderBottomColor: colors.border },
									]}
								>
									<View style={styles.flavorCellContent}>
										<View
											style={[
												styles.flavorColorIndicator,
												{ backgroundColor: FLAVOR_COLORS[flavor] },
											]}
										/>
										<Text style={[styles.flavorCell, { color: colors.text }]}>
											{flavor}
										</Text>
									</View>
									{PRODUCTION_PRODUCT_TYPES.map((product) => {
										const key = `${flavor}:${product}`;
										const value = quantities.get(key) || 0;
										const isReadOnly = productionStore.isReadOnly;
										return (
											<TextInput
												key={key}
												style={[
													styles.quantityCell,
													styles.quantityInput,
													{
														borderColor: colors.border,
														backgroundColor: colors.background,
														color: colors.text,
													},
												]}
												keyboardType="number-pad"
												value={String(value)}
												onChangeText={(text) =>
													handleQuantityChange(flavor, product, text)
												}
												editable={!isReadOnly}
												accessibilityLabel={`Sabor ${flavor}, producto ${PRODUCT_LABELS[product] ?? product}, cantidad`}
												onBlur={() => {
													// Validate on blur: ensure valid integer
													const keyStr = `${flavor}:${product}`;
													const numValue = quantities.get(keyStr) || 0;
													// Clamp to non-negative
													if (numValue < 0) {
														handleQuantityChange(flavor, product, "0");
													}
												}}
											/>
										);
									})}
								</View>
							))}
						</View>
					</View>
				)}

				{/* Customer Distribution */}
				<View style={[styles.section, { backgroundColor: colors.white }]}>
					<View style={styles.sectionTitleRow}>
						<Users size={22} color={colors.primary} />
						<Text style={[styles.sectionTitle, { color: colors.text }]}>
							Distribución de Clientes ({ordersForDate.length})
						</Text>
					</View>

					{ordersForDate.length === 0 ? (
						<Text style={[styles.emptyText, { color: colors.textLight }]}>
							No hay pedidos para esta fecha
						</Text>
					) : (
						ordersForDate.map((order) => (
							<View
								key={order.id}
								style={[
									styles.customerRow,
									{ borderBottomColor: colors.border },
								]}
							>
								<View>
									<Text style={[styles.customerName, { color: colors.text }]}>
										{order.gymName}
									</Text>
									<Text
										style={[styles.customerFlavor, { color: colors.textLight }]}
									>
										{order.flavor || "Sin sabor"}
									</Text>
								</View>
								<View style={styles.customerProducts}>
									{order.products.map((product, idx) => (
										<View
											key={idx}
											style={[
												styles.productBadge,
												{
													backgroundColor:
														getProductColor(product.type, colors) + "20",
												},
											]}
										>
											<Text
												style={[
													styles.productBadgeText,
													{ color: getProductColor(product.type, colors) },
												]}
											>
												{product.type}: {product.quantity}
											</Text>
										</View>
									))}
								</View>
							</View>
						))
					)}
				</View>

				{/* Distribution Summary */}
				<DistributionSummary
					summary={distributionSummary}
					colors={{
						background: colors.white,
						primary: colors.primary,
						text: colors.text,
						textLight: colors.textLight,
						white: colors.white,
						border: colors.border,
					}}
				/>

				{/* Version History */}
				<VersionHistory
					versions={versionsForDate}
					currentVersion={productionStore.currentVersion}
					onVersionSelect={handleVersionSelect}
					onClose={() => {}}
					colors={{
						background: colors.white,
						primary: colors.primary,
						text: colors.text,
						textLight: colors.textLight,
						warning: colors.warning,
						white: colors.white,
						border: colors.border,
					}}
				/>

				{/* Legacy Fix List */}
				<LegacyFixList
					orders={ordersForDate}
					onFix={handleFixLegacyOrder}
					colors={{
						background: colors.white,
						primary: colors.primary,
						text: colors.text,
						textLight: colors.textLight,
						warning: colors.warning,
						white: colors.white,
						border: colors.border,
					}}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}

function getProductColor(type: string, colors: ColorSet): string {
	switch (type) {
		case "A":
			return colors.productA;
		case "GNY":
			return colors.productGNY;
		case "C":
			return colors.productC;
		case "K":
			return colors.productK;
		default:
			return colors.primary;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		minHeight: 0,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: SIZES.padding,
		borderBottomWidth: 1,
	},
	title: {
		...FONTS.h2,
	},
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	sectionTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	headerActions: {
		flexDirection: "row",
		gap: 8,
	},
	iconButton: {
		padding: 8,
		borderRadius: SIZES.radius,
	},
	content: {
		flex: 1,
		minHeight: 0,
	},
	webContent: {
		// RN Web resolves the flex chain (parent is flex: 1 1 0, minHeight: 0) so
		// the ScrollView fills the column. Keep overflow visible here; scrolling
		// happens on this element, not the document body.
		overflow: "scroll",
	} as unknown as ViewStyle,
	contentContainer: {
		padding: SIZES.padding,
		flexGrow: Platform.OS === "web" ? undefined : 1,
	},
	dateSelector: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 16,
		borderRadius: SIZES.radius,
		marginBottom: 16,
	},
	dateNavButton: {
		padding: 8,
	},
	dateDisplay: {
		flexDirection: "row",
		alignItems: "center",
	},
	dateIcon: {
		marginRight: 8,
	},
	dateText: {
		...FONTS.body2,
		fontWeight: "600",
	},
	section: {
		padding: 16,
		borderRadius: SIZES.radius,
		marginBottom: 16,
	},
	sectionTitle: {
		...FONTS.h3,
		marginBottom: 12,
	},
	tableContainer: {
		borderRadius: SIZES.radius,
		overflow: "hidden",
	},
	tableHeader: {
		flexDirection: "row",
		padding: 12,
	},
	tableHeaderCell: {
		...FONTS.body3,
		fontWeight: "600",
		textAlign: "center",
	},
	tableRow: {
		flexDirection: "row",
		padding: 12,
		borderBottomWidth: 1,
		alignItems: "center",
	},
	flavorCellContent: {
		flex: 2,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	flavorColorIndicator: {
		width: 12,
		height: 12,
		borderRadius: 2,
	},
	flavorCell: {
		...FONTS.body3,
	},
	productCell: {
		flex: 1,
		textAlign: "center",
	},
	quantityCell: {
		flex: 1,
		borderWidth: 1,
		borderRadius: SIZES.radius,
		padding: 8,
		marginHorizontal: 4,
		alignItems: "center",
	},
	quantityText: {
		...FONTS.body2,
		fontWeight: "600",
	},
	quantityInput: {
		...FONTS.body2,
		fontWeight: "600",
		textAlign: "center",
		minWidth: 50,
	},
	emptyText: {
		...FONTS.body2,
		textAlign: "center",
		padding: 24,
	},
	customerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		borderBottomWidth: 1,
	},
	customerName: {
		...FONTS.body2,
		fontWeight: "600",
	},
	customerFlavor: {
		...FONTS.body3,
		marginTop: 2,
	},
	customerProducts: {
		flexDirection: "row",
		gap: 8,
	},
	productBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	productBadgeText: {
		...FONTS.body3,
		fontWeight: "600",
	},
});
