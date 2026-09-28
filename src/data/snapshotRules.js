/**
 * snapshotRules — Transparent front-end rules for the Situation Snapshot
 *
 * This file contains ALL the logic used to generate the Situation Snapshot.
 * It is completely transparent — no AI, no hidden algorithms.
 */

// Detail questions for each concern (used by SituationDetailsScreen)
export const detailQuestions = {
  'unpaid-work': [
    { key: 'frequency', label: 'How often does this happen?', type: 'select',
      options: ['Rarely', 'Sometimes', 'Often', 'Almost every shift'],
      helperText: 'Select the option that best describes your experience.' },
    { key: 'expectation', label: 'Were you asked to work the extra time, or did you feel expected to?', type: 'select',
      options: ['I was asked', 'I felt expected to', 'I\'m not sure'],
      helperText: 'This helps us understand the context of the extra work.' }
  ],
  'missed-breaks': [
    { key: 'frequency', label: 'How often do you miss breaks?', type: 'select',
      options: ['Rarely', 'Sometimes', 'Often', 'Almost every shift'],
      helperText: 'Select the option that best describes your experience.' },
    { key: 'breakType', label: 'Which breaks are you missing?', type: 'select',
      options: ['Meal break', 'Rest break', 'Both meal and rest breaks'],
      helperText: 'Different break types may be treated differently under workplace rules.' },
    { key: 'shiftLength', label: 'How long are your typical shifts?', type: 'select',
      options: ['Under 5 hours', '5 to 8 hours', 'Over 8 hours'],
      helperText: 'Shift length can affect which break rules may apply.' }
  ],
  'roster-changes': [
    { key: 'notice', label: 'How much notice do you usually get for changes?', type: 'select',
      options: ['More than 7 days', '2 to 7 days', 'Less than 48 hours', 'Same day'],
      helperText: 'The amount of notice given can be an important factor.' },
    { key: 'impact', label: 'How do these changes affect you?', type: 'select',
      options: ['No personal impact', 'Some inconvenience', 'Significant impact (e.g. childcare, transport, other job)'],
      helperText: 'This helps us understand the real-world effect on you.' },
    { key: 'rosterFrequency', label: 'How often do unexpected changes happen?', type: 'select',
      options: ['Once or twice', 'Regularly'],
      helperText: 'Frequency can affect how significant the concern is.' }
  ],
  'pay-uncertainty': [
    { key: 'issueType', label: 'What type of pay issue are you experiencing?', type: 'select',
      options: ['Payslip missing or incomplete', 'Rate seems lower than expected', 'Unexplained deductions', 'Not paid for all hours worked'],
      helperText: 'Select the description that best matches your situation.' },
    { key: 'duration', label: 'How long has this been happening?', type: 'select',
      options: ['One pay period', 'Multiple pay periods', 'Ongoing or I\'m not sure'],
      helperText: 'The duration of an issue can affect its significance.' },
    { key: 'awardKnown', label: 'Do you know which award or agreement covers your role?', type: 'select',
      options: ['Yes', 'No', 'I\'m not sure'],
      helperText: 'Your pay rate is usually set by an award, agreement, or contract.' }
  ],
  'other': [
    { key: 'description', label: 'Please briefly describe your concern', type: 'textarea',
      placeholder: 'Describe your workplace concern in a few sentences...',
      helperText: 'Please avoid including names, addresses, or other personal details.',
      maxLength: 300 }
  ]
}

// -------------------------------------------------------
// Scoring functions for each concern type
// -------------------------------------------------------

function scoreUnpaidWork(details, profile) {
  let score = 0
  const factors = []

  const freqScores = { 'Rarely': 1, 'Sometimes': 2, 'Often': 3, 'Almost every shift': 4 }
  const freqPoints = freqScores[details.frequency] || 0
  score += freqPoints
  if (freqPoints > 0) {
    factors.push({
      text: `Frequency: "${details.frequency}" — ${freqPoints >= 3 ? 'this significantly increases' : 'this contributes to'} the attention level`,
      impact: freqPoints >= 3 ? 'high' : 'medium'
    })
  }

  const expScores = { 'I was asked': 0, 'I felt expected to': 2, 'I\'m not sure': 1 }
  const expPoints = expScores[details.expectation] || 0
  score += expPoints
  if (details.expectation) {
    if (expPoints >= 2) {
      factors.push({
        text: `Expectation: "${details.expectation}" — feeling expected to work unpaid time is a significant factor`,
        impact: 'high'
      })
    } else if (expPoints === 1) {
      factors.push({
        text: `Expectation: "${details.expectation}" — this is a relevant consideration`,
        impact: 'low'
      })
    } else {
      factors.push({
        text: `Expectation: "${details.expectation}" — you indicated you were asked directly, which provides useful context`,
        impact: 'none'
      })
    }
  }

  if (profile.employmentType === 'Casual') {
    score += 1
    factors.push({ text: 'Employment type: Casual — casual workers may have less predictable working arrangements', impact: 'low' })
  }

  const hours = parseFloat(profile.hoursPerWeek)
  if (!isNaN(hours) && hours > 38) {
    score += 1
    factors.push({ text: `Hours: ${profile.hoursPerWeek} hours per week — working above standard full-time hours may be relevant`, impact: 'medium' })
  }

  return { score, factors }
}

function scoreMissedBreaks(details, profile) {
  let score = 0
  const factors = []

  const freqScores = { 'Rarely': 1, 'Sometimes': 2, 'Often': 3, 'Almost every shift': 4 }
  const freqPoints = freqScores[details.frequency] || 0
  score += freqPoints
  if (freqPoints > 0) {
    factors.push({
      text: `Frequency: "${details.frequency}" — ${freqPoints >= 3 ? 'regularly missing breaks is a significant factor' : 'this contributes to the attention level'}`,
      impact: freqPoints >= 3 ? 'high' : 'medium'
    })
  }

  const shiftScores = { 'Under 5 hours': 0, '5 to 8 hours': 1, 'Over 8 hours': 2 }
  const shiftPoints = shiftScores[details.shiftLength] || 0
  score += shiftPoints
  if (shiftPoints >= 2) {
    factors.push({ text: `Shift length: "${details.shiftLength}" — longer shifts may have specific break entitlements`, impact: 'medium' })
  } else if (shiftPoints === 1) {
    factors.push({ text: `Shift length: "${details.shiftLength}" — longer shifts may have specific break entitlements`, impact: 'low' })
  } else {
    factors.push({ text: `Shift length: "${details.shiftLength}" — shorter shifts may not require breaks under some workplace rules`, impact: 'none' })
  }

  if (details.breakType === 'Both meal and rest breaks') {
    score += 2
    factors.push({ text: 'Break type: Both meal and rest breaks are being missed — this is more significant than missing one type', impact: 'high' })
  } else if (details.breakType === 'Meal break' || details.breakType === 'Rest break') {
    score += 1
    factors.push({ text: `Break type: ${details.breakType} is being missed`, impact: 'medium' })
  }

  return { score, factors }
}

function scoreRosterChanges(details, profile) {
  let score = 0
  const factors = []
  const ns = { 'More than 7 days': 0, '2 to 7 days': 1, 'Less than 48 hours': 2, 'Same day': 3 }
  const np = ns[details.notice] || 0
  score += np
  if (np >= 2) {
    factors.push({ text: `Notice: "${details.notice}"`, impact: 'high' })
  } else if (np === 1) {
    factors.push({ text: `Notice: "${details.notice}"`, impact: 'medium' })
  } else {
    factors.push({ text: `Notice: "${details.notice}" — receiving adequate notice is a positive factor`, impact: 'none' })
  }
  const ims = { 'No personal impact': 0, 'Some inconvenience': 1, 'Significant impact (e.g. childcare, transport, other job)': 3 }
  const ip = ims[details.impact] || 0
  score += ip
  if (ip >= 3) {
    factors.push({ text: `Impact: "${details.impact}"`, impact: 'high' })
  } else if (ip === 1) {
    factors.push({ text: `Impact: "${details.impact}"`, impact: 'low' })
  } else {
    factors.push({ text: `Impact: "${details.impact}" — no personal impact reported`, impact: 'none' })
  }
  const fs = { 'Once or twice': 1, 'Regularly': 3 }
  const fp = fs[details.rosterFrequency] || 0
  score += fp
  if (fp > 0) factors.push({ text: `Frequency: "${details.rosterFrequency}"`, impact: fp >= 3 ? 'high' : 'low' })
  if (profile.employmentType === 'Casual') { score += 1; factors.push({ text: 'Employment type: Casual', impact: 'low' }) }
  return { score, factors }
}

function scorePayUncertainty(details, profile) {
  let score = 0
  const factors = []
  const is = { 'Payslip missing or incomplete': 2, 'Rate seems lower than expected': 2, 'Unexplained deductions': 3, 'Not paid for all hours worked': 3 }
  const ip = is[details.issueType] || 0
  score += ip
  if (ip > 0) factors.push({ text: `Issue: "${details.issueType}"`, impact: ip >= 3 ? 'high' : 'medium' })
  const ds = { 'One pay period': 1, 'Multiple pay periods': 2, "Ongoing or I'm not sure": 2 }
  const dp = ds[details.duration] || 0
  score += dp
  if (dp > 0) factors.push({ text: `Duration: "${details.duration}"`, impact: dp >= 2 ? 'medium' : 'low' })
  if (details.awardKnown === 'No' || details.awardKnown === "I'm not sure") {
    score += 1
    factors.push({ text: `Award awareness: "${details.awardKnown}"`, impact: 'medium' })
  } else if (details.awardKnown === 'Yes') {
    factors.push({ text: `Award awareness: "${details.awardKnown}" — knowing your applicable award or agreement is helpful`, impact: 'none' })
  }
  return { score, factors }
}

function scoreOther() { return { score: 2, factors: [{ text: 'Custom concern — limited assessment.', impact: 'low' }] } }

function getAttentionLevel(score) {
  if (score <= 2) return { level: 'low', label: 'Low concern', description: 'Your situation appears to involve a low level of concern.' }
  if (score <= 5) return { level: 'review', label: 'Review recommended', description: 'Some factors may warrant further review.' }
  return { level: 'attention', label: 'Attention recommended', description: 'Several factors suggest paying closer attention may be worthwhile.' }
}

function getGuidance(level) {
  const end = 'If you are in immediate danger or the situation involves serious safety concerns, contact emergency or workplace safety services.'
  if (level === 'low') return ['Keep a personal record of the situation.', 'Review your employment agreement or award.', end]
  if (level === 'review') return ['Review your employment agreement or award.', 'Keep written records of shifts, hours, and communications.', 'Contact your state or territory workplace relations body.', end]
  return ['Contact the Fair Work Ombudsman or your local workplace relations body.', 'Seek advice from a community legal centre.', 'Keep detailed written records.', 'Consider your workplace dispute resolution process.', end]
}

export function calculateSnapshot(workProfile, concern, situationDetails) {
  let result
  switch (concern) {
    case 'unpaid-work': result = scoreUnpaidWork(situationDetails, workProfile); break
    case 'missed-breaks': result = scoreMissedBreaks(situationDetails, workProfile); break
    case 'roster-changes': result = scoreRosterChanges(situationDetails, workProfile); break
    case 'pay-uncertainty': result = scorePayUncertainty(situationDetails, workProfile); break
    case 'other': result = scoreOther(); break
    default: result = { score: 0, factors: [] }
  }
  const { level, label, description } = getAttentionLevel(result.score)
  return { score: result.score, level, levelLabel: label, levelDescription: description, factors: result.factors, guidance: getGuidance(level) }
}

