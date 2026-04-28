import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";
import { type Quote, type QuoteItem } from "@/lib/api/crm";

const BLUE  = "#0055CC";
const INK   = "#0f1923";
const DIM   = "#4a5568";
const BG    = "#f5f7fa";
const WHITE = "#ffffff";
export const IVA = 0.16;

const s = StyleSheet.create({
  page:        { backgroundColor: WHITE, paddingTop: 40, paddingBottom: 50, paddingLeft: 50, paddingRight: 50, fontFamily: "Helvetica", fontSize: 9, color: INK },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  logoText:    { fontSize: 22, fontFamily: "Helvetica-Bold", color: INK },
  logoBlue:    { color: BLUE },
  logoSub:     { fontSize: 7, color: DIM, marginTop: 2 },
  metaBox:     { alignItems: "flex-end" },
  metaLabel:   { fontSize: 7, color: DIM, marginBottom: 2 },
  metaVal:     { fontSize: 9, color: INK },
  accentLine:  { height: 2, backgroundColor: BLUE, marginBottom: 28 },
  section:     { marginBottom: 22 },
  sLabel:      { fontSize: 7, color: DIM, marginBottom: 6 },
  row:         { flexDirection: "row", marginBottom: 3 },
  fieldKey:    { width: 130, fontSize: 8.5, color: DIM },
  fieldVal:    { flex: 1, fontSize: 8.5, color: INK },
  clientName:  { fontSize: 14, fontFamily: "Helvetica-Bold", color: INK, marginBottom: 2 },
  clientSub:   { fontSize: 9, color: DIM, marginBottom: 1 },
  clientEmail: { fontSize: 9, color: BLUE },
  desc:        { fontSize: 8.5, color: INK, lineHeight: 1.6 },

  tableHead:   { flexDirection: "row", backgroundColor: INK, paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10, marginBottom: 1 },
  tableRow:    { flexDirection: "row", paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: "#d1d9e6", borderBottomStyle: "solid" },
  tableRowAlt: { flexDirection: "row", paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10, backgroundColor: BG, borderBottomWidth: 1, borderBottomColor: "#d1d9e6", borderBottomStyle: "solid" },
  colDesc:     { flex: 1, fontSize: 8, color: WHITE },
  colQty:      { width: 40, fontSize: 8, color: WHITE, textAlign: "center" },
  colUnit:     { width: 80, fontSize: 8, color: WHITE, textAlign: "right" },
  colTotal:    { width: 80, fontSize: 8, color: WHITE, textAlign: "right" },
  colDescBody: { flex: 1, fontSize: 8.5, color: INK },
  colQtyBody:  { width: 40, fontSize: 8.5, color: DIM, textAlign: "center" },
  colUnitBody: { width: 80, fontSize: 8.5, color: DIM, textAlign: "right" },
  colTotalB:   { width: 80, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: INK, textAlign: "right" },

  totalsBox:   { marginTop: 2, alignItems: "flex-end" },
  totalRow:    { flexDirection: "row", width: 220, justifyContent: "space-between", paddingTop: 3, paddingBottom: 3 },
  totalLabel:  { fontSize: 8.5, color: DIM },
  totalVal:    { fontSize: 8.5, color: INK },
  grandRow:    { flexDirection: "row", width: 220, justifyContent: "space-between", backgroundColor: BLUE, paddingTop: 7, paddingBottom: 7, paddingLeft: 10, paddingRight: 10, marginTop: 4 },
  grandLabel:  { fontSize: 9, fontFamily: "Helvetica-Bold", color: WHITE },
  grandVal:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: WHITE },

  footer:      { position: "absolute", bottom: 30, left: 50, right: 50, borderTopWidth: 1, borderTopColor: "#d1d9e6", borderTopStyle: "solid", paddingTop: 10, flexDirection: "row", justifyContent: "space-between" },
  footerText:  { fontSize: 7, color: DIM },
  disclaimer:  { fontSize: 7, color: DIM },
});

function fmt(n: number) {
  return "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateStr() {
  return new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function quoteNum(id: string) {
  return "COT-" + id.slice(-6).toUpperCase();
}

interface Props { quote: Quote }

export function QuotePDFDoc({ quote: q }: Props) {
  const items: QuoteItem[] = Array.isArray(q.items) && q.items.length > 0
    ? q.items
    : q.price
      ? [{ description: q.projectType ? `Desarrollo ${q.projectType}` : "Proyecto digital", qty: 1, unitPrice: q.price }]
      : [];

  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const iva      = subtotal * IVA;
  const total    = subtotal + iva;

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        <View style={s.header}>
          <View>
            <Text style={s.logoText}>meza<Text style={s.logoBlue}>digital</Text></Text>
            <Text style={s.logoSub}>Soluciones Digitales</Text>
          </View>
          <View style={s.metaBox}>
            <Text style={s.metaLabel}>Cotización</Text>
            <Text style={{ ...s.metaVal, fontFamily: "Helvetica-Bold", fontSize: 12, color: BLUE }}>{quoteNum(q.id)}</Text>
            <Text style={{ ...s.metaLabel, marginTop: 6 }}>Fecha</Text>
            <Text style={s.metaVal}>{dateStr()}</Text>
            {q.timeline ? (
              <View>
                <Text style={{ ...s.metaLabel, marginTop: 6 }}>Tiempo estimado</Text>
                <Text style={s.metaVal}>{q.timeline}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={s.accentLine} />

        <View style={s.section}>
          <Text style={s.sLabel}>PARA</Text>
          <Text style={s.clientName}>{q.name}</Text>
          {q.company ? <Text style={s.clientSub}>{q.company}</Text> : null}
          <Text style={s.clientEmail}>{q.email}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sLabel}>DETALLES DEL PROYECTO</Text>
          {(q.projectType ? [["Tipo de proyecto", q.projectType]] : [])
            .concat(q.techStack ? [["Tech stack", q.techStack]] : [])
            .map(([k, v]) => (
              <View key={k} style={s.row}>
                <Text style={s.fieldKey}>{k}</Text>
                <Text style={s.fieldVal}>{v}</Text>
              </View>
            ))}
        </View>

        <View style={s.section}>
          <Text style={s.sLabel}>ALCANCE DEL PROYECTO</Text>
          <Text style={s.desc}>{q.description}</Text>
        </View>

        {items.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sLabel}>DESGLOSE DE COSTOS</Text>
            <View style={s.tableHead}>
              <Text style={s.colDesc}>Concepto</Text>
              <Text style={s.colQty}>Cant.</Text>
              <Text style={s.colUnit}>Precio unit.</Text>
              <Text style={s.colTotal}>Total</Text>
            </View>
            {items.map((it, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={s.colDescBody}>{it.description}</Text>
                <Text style={s.colQtyBody}>{String(it.qty)}</Text>
                <Text style={s.colUnitBody}>{fmt(it.unitPrice)}</Text>
                <Text style={s.colTotalB}>{fmt(it.qty * it.unitPrice)}</Text>
              </View>
            ))}
            <View style={s.totalsBox}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalVal}>{fmt(subtotal)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>IVA (16%)</Text>
                <Text style={s.totalVal}>{fmt(iva)}</Text>
              </View>
              <View style={s.grandRow}>
                <Text style={s.grandLabel}>TOTAL</Text>
                <Text style={s.grandVal}>{fmt(total)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {q.notes ? (
          <View style={{ ...s.section, backgroundColor: BG, padding: 12, marginTop: 8 }}>
            <Text style={s.sLabel}>NOTAS ADICIONALES</Text>
            <Text style={s.desc}>{q.notes}</Text>
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>mezadigital.com  ·  contacto@mezadigital.com</Text>
          <Text style={s.disclaimer}>* Precios expresados en MXN, mas IVA (16%)</Text>
        </View>

      </Page>
    </Document>
  );
}
