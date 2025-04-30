document.addEventListener('DOMContentLoaded', function () {
    let dadosProdutos = [];

    fetch('infos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados');
            }
            return response.json();
        })
        .then(data => {
            dadosProdutos = data.Produtos;
            exibirProdutos(dadosProdutos);
            atualizarEstatisticas(dadosProdutos);


            document.querySelectorAll('input[name="filter"]').forEach(radio => {
                radio.addEventListener('change', function () {
                    filtrarProdutos(this.value);
                });
            });

            document.getElementById('search-input').addEventListener('input', function () {
                buscarProdutos(this.value);
            });
        })
        .catch(error => {
            console.error('Erro:', error);
            const produtosBody = document.getElementById('produtos-body');
            produtosBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Erro ao carregar os dados. Verifique o arquivo JSON.</td></tr>';
        });

    function exibirProdutos(produtos) {
        const produtosBody = document.getElementById('produtos-body');
        produtosBody.innerHTML = '';

        if (produtos.length === 0) {
            produtosBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Nenhum produto encontrado</td></tr>';
            return;
        }

        produtos.forEach(produto => {
            const linha = document.createElement('tr');

            let status = '';
            let classeStatus = '';

            if (produto.estoque < produto.minimo) {
                status = 'Baixo';
                classeStatus = 'status-danger';
            } else if (produto.estoque > produto.maximo) {
                status = 'Alto';
                classeStatus = 'status-warning';
            } else {
                status = 'Normal';
                classeStatus = 'status-normal';
            }

            const precoCalculado = produto.preco_compra * (1 + produto.lucro / 100);
            const diferenca = Math.abs(precoCalculado - produto.preco_venda);

            if (diferenca > 0.05) {
                status = 'Lucro Incorreto';
                classeStatus = 'status-info';
            }

            linha.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.descricao}</td>
                <td>${produto.unidade}</td>
                <td>R$ ${produto.preco_compra.toFixed(2)}</td>
                <td>${produto.lucro}%</td>
                <td>R$ ${produto.preco_venda.toFixed(2)}</td>
                <td>${produto.estoque}</td>
                <td>${produto.minimo}</td>
                <td>${produto.maximo}</td>
                <td><span class="status ${classeStatus}">${status}</span></td>
            `;

            produtosBody.appendChild(linha);
        });
    }

    function filtrarProdutos(tipoFiltro) {
        let produtosFiltrados = [];

        switch (tipoFiltro) {
            case 'low':
                produtosFiltrados = dadosProdutos.filter(p => p.estoque < p.minimo);
                break;
            case 'high':
                produtosFiltrados = dadosProdutos.filter(p => p.estoque > p.maximo);
                break;
            case 'profit':
                produtosFiltrados = dadosProdutos.filter(p => {
                    const precoCalculado = p.preco_compra * (1 + p.lucro / 100);
                    return Math.abs(precoCalculado - p.preco_venda) > 0.05;
                });
                break;
            default:
                produtosFiltrados = dadosProdutos;
        }

        exibirProdutos(produtosFiltrados);
        atualizarEstatisticas(produtosFiltrados);
    }

    function buscarProdutos(termoBusca) {
        const termo = termoBusca.toLowerCase();
        const produtosFiltrados = dadosProdutos.filter(p =>
            p.descricao.toLowerCase().includes(termo) ||
            p.id.toString().includes(termo)
        );

        exibirProdutos(produtosFiltrados);
        atualizarEstatisticas(produtosFiltrados);
    }

    function atualizarEstatisticas(produtos) {
        document.getElementById('total-produtos').textContent = produtos.length;

        const totalEstoque = produtos.reduce((total, p) => total + p.estoque, 0);
        document.getElementById('total-estoque').textContent = totalEstoque;

        const qtdEstoqueBaixo = produtos.filter(p => p.estoque < p.minimo).length;
        document.getElementById('baixo-estoque').textContent = qtdEstoqueBaixo;

        const qtdLucroIncorreto = produtos.filter(p => {
            const precoCalculado = p.preco_compra * (1 + p.lucro / 100);
            return Math.abs(precoCalculado - p.preco_venda) > 0.05;
        }).length;
        document.getElementById('lucro-incorreto').textContent = qtdLucroIncorreto;
    }
});