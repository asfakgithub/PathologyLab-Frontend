// Utility to format structured referenceRange objects into a concise display string
export default function formatReferenceRange(range, patient = {}) {
  if (!range) return '';
  if (typeof range === 'string') return range;
  if (typeof range === 'object') {
    const hasStructured = ['male','female','child','infant'].some(k => !!range[k]);
    if (hasStructured) {
      const genderRaw = (patient && patient.gender) ? String(patient.gender).toLowerCase() : '';
      const age = Number(patient?.age) || null;
      let group = 'male';
      if (genderRaw.startsWith('f')) group = 'female';
      else if (age !== null) {
        if (age < 1) group = 'infant';
        else if (age < 18) group = 'child';
        else group = 'male';
      }
      const g = range[group] || {};
      const min = g.min || '';
      const max = g.max || '';
      if (min || max) return `${min}${max ? ' - ' + max : ''}`.trim();

      const parts = [];
      if (range.male) parts.push(`M: ${range.male.min || ''}${range.male.max ? ' - ' + range.male.max : ''}`);
      if (range.female) parts.push(`F: ${range.female.min || ''}${range.female.max ? ' - ' + range.female.max : ''}`);
      if (range.child) parts.push(`Child: ${range.child.min || ''}${range.child.max ? ' - ' + range.child.max : ''}`);
      if (range.infant) parts.push(`Infant: ${range.infant.min || ''}${range.infant.max ? ' - ' + range.infant.max : ''}`);
      return parts.join(', ');
    }

    // Legacy shapes like { adult: '', child: '' }
    if (range.adult || range.child) {
      return `Adult: ${range.adult || ''}${range.child ? ', Child: ' + range.child : ''}`.trim();
    }
  }
  return '';
}
