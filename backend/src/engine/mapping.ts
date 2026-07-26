import { v4 as uuidv4 } from 'uuid';

export function mapComponents(text: string) {
  return [
    {
      id: uuidv4(),
      title: 'Factuur-Check Script',
      description: 'Automatische factuurcontrole.',
      requiredTools: ['Mailbox Connector', 'OCR Engine'],
      baseImpact: 8
    }
  ];
}
