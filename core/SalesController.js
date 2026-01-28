import { db } from './DataManager.js';

/**
 * Controlador de Lógica de Negócio para Vendas
 */
export class SalesController {
  static cadastrarCliente(nome) {
    if (!nome || nome.trim() === '') throw new Error('Nome do cliente é obrigatório.');
    return db.addCliente(nome);
  }

  static cadastrarProduto(nome, preco, estoque) {
    if (!nome) throw new Error('Nome do produto é obrigatório.');
    if (isNaN(preco) || preco <= 0) throw new Error('Preço inválido.');
    if (isNaN(estoque) || estoque < 0) throw new Error('Estoque inválido.');
    return db.addProduto(nome, preco, estoque);
  }

  static listarClientes() {
    return db.clientes;
  }

  static listarProdutos() {
    return db.produtos;
  }

  static realizarVenda(idCliente, itens) {
    // Validações básicas
    const cliente = db.clientes.find(c => c.id === parseInt(idCliente));
    if (!cliente) throw new Error('Cliente não encontrado.');
    if (!itens || itens.length === 0) throw new Error('A venda deve ter pelo menos um item.');

    // Validar estoque de todos os itens antes de processar
    for (const item of itens) {
      const produto = db.getProdutoById(item.idProduto);
      if (!produto) throw new Error(`Produto ID ${item.idProduto} não encontrado.`);
      if (produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para o produto: ${produto.nome}. Disponível: ${produto.estoque}`);
      }
    }

    // Criar a venda
    const venda = db.createVenda(idCliente);

    // Adicionar itens e atualizar estoque
    for (const item of itens) {
      const produto = db.getProdutoById(item.idProduto);
      db.addItemVenda(venda.id, item.idProduto, item.quantidade, produto.preco);
      db.updateEstoque(item.idProduto, item.quantidade);
    }

    return venda;
  }

  static obterRelatorio() {
    return db.getRelatorioVendas();
  }
}
