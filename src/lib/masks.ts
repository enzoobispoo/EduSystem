// Máscara para CPF: 000.000.000-00
export const maskCPF = (value: string): string => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após terceiro dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após sexto dígito
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen antes dos dois últimos dígitos
  };
  
  // Máscara para telefone: (00) 00000-0000
  export const maskPhone = (value: string): string => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses no DDD
      .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen após quinto dígito
      .replace(/(-\d{4})\d+?$/, '$1'); // Limita a 4 dígitos após o hífen
  };
  
  // Função para aplicar máscara em tempo real
  export const applyMask = (
    e: React.ChangeEvent<HTMLInputElement>, 
    maskFunction: (value: string) => string
  ) => {
    e.target.value = maskFunction(e.target.value);
  };

export const maskMoney = (value: string): string => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/(\d)(\d{2})$/, '$1.$2') // Coloca ponto antes dos dois últimos dígitos
      .replace(/(?=(\d{3})+(\D))\B/g, ','); // Coloca vírgula a cada três dígitos
  };