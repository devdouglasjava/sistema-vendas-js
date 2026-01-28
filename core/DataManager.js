/**
 * DataManager (Browser-friendly)
 * - Mantém os dados em memória (arrays)
 * - (Opcional) persiste no localStorage do navegador
 */
class DataManager {
  constructor() {
    if (DataManager.instance) return DataManager.instance;

    this.clientes = [];
    this.produtos = [];
    this.vendas = [];
    this.itensVenda = [];

    // Se estiver no navegador, tenta carregar
    this.#loadFromLocalStorage();

    DataManager.instance = this;
  }

  // --------- Persistência simples ---------
  #loadFromLocalStorage() {
    if (typeof window === 'undefined') return; // Node
    const raw = localStorage.getItem('sistemaVendasDB');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      this.clientes = parsed.clientes ?? [];
      this.produtos = parsed.produtos ?? [];
      this.vendas = parsed.vendas ?? [];
      this.itensVenda = parsed.itensVenda ?? [];
    } catch {
      // se der erro, ignora
    }
  }

  #saveToLocalStorage() {
    if (typeof window === 'undefined') return; // Node
    const data = {
      clientes: this.clientes,
      produtos: this.produtos,
      vendas: this.vendas,
      itensVenda: this.itensVenda
    };
    localStorage.setItem('sistemaVendasDB', JSON.stringify(data));
  }

  // --------- Clientes ---------
  addCliente(nome) {
    const id = this.clientes.length + 1;
    const novoCliente = { id, nome };
    this.clientes.push(novoCliente);
    this.#saveToLocalStorage();
    return novoCliente;
  }

  // --------- Produtos ---------
  addProduto(nome, preco, estoque) {
    const id = this.produtos.length + 1;
    const novoProduto = {
      id,
      nome,
      preco: parseFloat(preco),
      estoque: parseInt(estoque)
    };
    this.produtos.push(novoProduto);
    this.#saveToLocalStorage();
    return novoProduto;
  }

  getProdutoById(id) {
    return this.produtos.find(p => p.id === parseInt(id));
  }

  updateEstoque(idProduto, quantidade) {
    const produto = this.getProdutoById(idProduto);
    if (produto) {
      produto.estoque -= quantidade;
      this.#saveToLocalStorage();
    }
  }

  // --------- Vendas ---------
  createVenda(idCliente) {
    const id = this.vendas.length + 1;
    const novaVenda = {
      id,
      idCliente: parseInt(idCliente),
      data: new Date().toISOString(),
      status: 'CONCLUIDA'
    };
    this.vendas.push(novaVenda);
    this.#saveToLocalStorage();
    return novaVenda;
  }

  addItemVenda(idVenda, idProduto, quantidade, precoUnitario) {
    const item = {
      idVenda,
      idProduto: parseInt(idProduto),
      quantidade: parseInt(quantidade),
      precoUnitario: parseFloat(precoUnitario),
      subtotal: parseInt(quantidade) * parseFloat(precoUnitario)
    };
    this.itensVenda.push(item);
    this.#saveToLocalStorage();
    return item;
  }

  getRelatorioVendas() {
    return this.vendas.map(venda => {
      const cliente = this.clientes.find(c => c.id === venda.idCliente);
      const itens = this.itensVenda.filter(i => i.idVenda === venda.id);
      const total = itens.reduce((acc, item) => acc + item.subtotal, 0);

      return {
        ...venda,
        nomeCliente: cliente ? cliente.nome : 'Desconhecido',
        itens: itens.map(item => {
          const produto = this.getProdutoById(item.idProduto);
          return { ...item, nomeProduto: produto ? produto.nome : 'Produto Removido' };
        }),
        total
      };
    });
  }
}

export const db = new DataManager();
