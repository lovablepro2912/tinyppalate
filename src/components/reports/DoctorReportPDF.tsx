import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format, parseISO } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #0d9488',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1 solid #e5e5e5',
  },
  safeFoodsList: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#333',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e5e5',
  },
  tableRowSevere: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e5e5',
    backgroundColor: '#fef2f2',
  },
  colDate: { width: '18%' },
  colTime: { width: '12%' },
  colFood: { width: '25%' },
  colStatus: { width: '15%' },
  colNotes: { width: '30%' },
  // Reaction table columns
  colReactionDate: { width: '15%' },
  colReactionFood: { width: '18%' },
  colReaction: { width: '15%' },
  colSymptoms: { width: '25%' },
  colReactionNotes: { width: '27%' },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenCard: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    marginBottom: 8,
  },
  allergenCardReaction: {
    width: '48%',
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    marginBottom: 8,
  },
  allergenCardSafe: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    marginBottom: 8,
  },
  allergenName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  allergenStatus: {
    fontSize: 10,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    borderTop: '1 solid #e5e5e5',
    paddingTop: 10,
  },
  tableRowMild: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e5e5',
    backgroundColor: '#fefce8',
  },
  tableRowSafe: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e5e5',
    backgroundColor: '#f0fdf4',
  },
  noData: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
});

interface LogEntry {
  id: string;
  created_at: string;
  reaction_severity: 0 | 1 | 2;
  notes: string;
  foodName: string;
  foodEmoji: string;
}

interface AllergenStatus {
  name: string;
  emoji: string;
  status: 'SAFE' | 'TRYING' | 'REACTION' | 'TO_TRY';
  exposureCount: number;
}

interface DoctorReportPDFProps {
  babyName: string;
  startDate: Date;
  endDate: Date;
  safeFoods: string[];
  allLogs: LogEntry[];
  reactionLogs: LogEntry[];
  allergenStatuses: AllergenStatus[];
}

export function DoctorReportPDF({
  babyName,
  startDate,
  endDate,
  safeFoods,
  allLogs,
  reactionLogs,
  allergenStatuses,
}: DoctorReportPDFProps) {
  const dateRange = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  
  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return 'Mild';
      case 2: return 'SEVERE';
      default: return 'Safe';
    }
  };

  const getStatusLabel = (severity: number) => {
    switch (severity) {
      case 1: return 'Mild Reaction';
      case 2: return 'Severe Reaction';
      default: return 'Tolerated';
    }
  };

  const extractSymptoms = (notes: string) => {
    if (!notes) return '-';
    const match = notes.match(/Symptoms: ([^.]+)/);
    return match ? match[1] : '-';
  };

  const extractNotes = (notes: string) => {
    if (!notes) return '-';
    const cleaned = notes.replace(/Symptoms: [^.]+\. ?/, '').trim();
    return cleaned || '-';
  };

  const getAllergenStatusText = (allergen: AllergenStatus) => {
    if (allergen.status === 'SAFE') return '✓ Safe (3/3 exposures)';
    if (allergen.status === 'REACTION') return '⚠ Reaction observed';
    if (allergen.status === 'TRYING') return `In progress: ${allergen.exposureCount}/3 exposures`;
    return 'Not yet introduced';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Allergy & Intake Report</Text>
          <Text style={styles.subtitle}>Patient: {babyName}</Text>
          <Text style={styles.subtitle}>Report Period: {dateRange}</Text>
          <Text style={styles.subtitle}>Generated: {format(new Date(), 'MMMM d, yyyy')}</Text>
        </View>

        {/* Section 1: Safe Foods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safe Foods ({safeFoods.length})</Text>
          {safeFoods.length > 0 ? (
            <Text style={styles.safeFoodsList}>{safeFoods.join(', ')}</Text>
          ) : (
            <Text style={styles.noData}>No foods have been confirmed safe yet.</Text>
          )}
        </View>

        {/* Section 2: Complete Feeding Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Complete Feeding Log ({allLogs.length} entries)</Text>
          {allLogs.length > 0 ? (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.colDate}>Date</Text>
                <Text style={styles.colTime}>Time</Text>
                <Text style={styles.colFood}>Food</Text>
                <Text style={styles.colStatus}>Status</Text>
                <Text style={styles.colNotes}>Notes</Text>
              </View>
              {/* Table Rows */}
              {allLogs.map((log) => (
                <View
                  key={log.id}
                  style={
                    log.reaction_severity === 2 
                      ? styles.tableRowSevere 
                      : log.reaction_severity === 1 
                      ? styles.tableRowMild
                      : styles.tableRow
                  }
                >
                  <Text style={styles.colDate}>{format(parseISO(log.created_at), 'MM/dd/yy')}</Text>
                  <Text style={styles.colTime}>{format(parseISO(log.created_at), 'h:mm a')}</Text>
                  <Text style={styles.colFood}>{log.foodName}</Text>
                  <Text style={styles.colStatus}>{getStatusLabel(log.reaction_severity)}</Text>
                  <Text style={styles.colNotes}>{extractNotes(log.notes) || '-'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No food entries during this period.</Text>
          )}
        </View>

        {/* Section 3: Reaction History (Reactions Only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reaction Details ({reactionLogs.length} incidents)</Text>
          {reactionLogs.length > 0 ? (
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.colReactionDate}>Date</Text>
                <Text style={styles.colReactionFood}>Food</Text>
                <Text style={styles.colReaction}>Severity</Text>
                <Text style={styles.colSymptoms}>Symptoms</Text>
                <Text style={styles.colReactionNotes}>Notes</Text>
              </View>
              {/* Table Rows */}
              {reactionLogs.map((log) => (
                <View
                  key={log.id}
                  style={log.reaction_severity === 2 ? styles.tableRowSevere : styles.tableRowMild}
                >
                  <Text style={styles.colReactionDate}>{format(parseISO(log.created_at), 'MM/dd/yy')}</Text>
                  <Text style={styles.colReactionFood}>{log.foodName}</Text>
                  <Text style={styles.colReaction}>{getSeverityLabel(log.reaction_severity)}</Text>
                  <Text style={styles.colSymptoms}>{extractSymptoms(log.notes)}</Text>
                  <Text style={styles.colReactionNotes}>{extractNotes(log.notes)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noData}>No reactions recorded during this period. Great news!</Text>
          )}
        </View>

        {/* Section 4: Allergen Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Allergen Status</Text>
          <View style={styles.allergenGrid}>
            {allergenStatuses.map((allergen) => (
              <View
                key={allergen.name}
                style={
                  allergen.status === 'SAFE'
                    ? styles.allergenCardSafe
                    : allergen.status === 'REACTION'
                    ? styles.allergenCardReaction
                    : styles.allergenCard
                }
              >
                <Text style={styles.allergenName}>{allergen.name}</Text>
                <Text style={styles.allergenStatus}>{getAllergenStatusText(allergen)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was generated by TinyPalate for informational purposes. 
          Please consult with a healthcare provider for medical advice.
        </Text>
      </Page>
    </Document>
  );
}
