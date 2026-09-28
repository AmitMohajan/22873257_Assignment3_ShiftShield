/**
 * concernOptions — Workplace concerns the user can select
 *
 * Each concern has:
 *   id          — Unique string key (used in state and snapshot rules)
 *   title       — Short label shown on the card
 *   description — One-line explanation shown on the card
 *   icon        — Lucide icon name (we'll import these in the screen)
 */

const concernOptions = [
  {
    id: 'unpaid-work',
    title: 'Unpaid additional work',
    description: 'You may be working extra time that you are not being paid for, such as staying back after shifts or working through breaks.'
  },
  {
    id: 'missed-breaks',
    title: 'Missed or shortened breaks',
    description: 'You may be missing meal or rest breaks during your shifts, or having breaks cut short.'
  },
  {
    id: 'roster-changes',
    title: 'Unexpected roster or schedule changes',
    description: 'Your shifts may be changed with little notice, or you may be asked to work at short notice.'
  },
  {
    id: 'pay-uncertainty',
    title: 'Pay uncertainty or discrepancies',
    description: 'You may be unsure whether your pay rate is correct, or you may have noticed unexpected deductions or missing payslips.'
  },
  {
    id: 'other',
    title: 'Other concern',
    description: 'Your situation doesn\'t match the options above. You can describe it in the next step.'
  }
]

export default concernOptions
