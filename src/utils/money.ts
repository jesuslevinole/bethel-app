const moneyFormatter = new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' });

export const formatMoney = (amount: number) => moneyFormatter.format(Number.isFinite(amount) ? amount : 0);

// Redondea a centavos para que las sumas de decimales no arrastren errores de punto flotante.
export const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

export const sumMoney = (amounts: number[]) => roundMoney(amounts.reduce((total, amount) => total + amount, 0));

// Texto de un input numérico → número no negativo (vacío o inválido = 0).
export const parseAmount = (text: string) => {
  const amount = Number.parseFloat(text);
  return Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : 0;
};
