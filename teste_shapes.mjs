import fs from 'fs';
// Importação corrigida para módulos CommonJS no Node
import sgf from '@sabaki/sgf';
import goBoard from '@sabaki/go-board';
const { fromDimensions } = goBoard;
import boardmatcher from '@sabaki/boardmatcher';

// Pega o nome do arquivo dos argumentos do terminal
const inputFile = process.argv[2];

if (!inputFile) {
    console.error("ERRO: Por favor, forneça o nome do arquivo SGF.");
    console.error("Exemplo de uso: node teste_shapes.mjs meu_jogo.sgf");
    process.exit(1);
}

// Verifica se o arquivo existe
if (!fs.existsSync(inputFile)) {
    console.error(`ERRO: O arquivo '${inputFile}' não foi encontrado.`);
    process.exit(1);
}

// Lê o arquivo
const content = fs.readFileSync(inputFile, 'utf8');
const rootNodes = sgf.parse(content);

console.log(`Analisando ${inputFile}...`);

// Função recursiva para percorrer a árvore do jogo
function traverse(node, board) {
    let nextBoard = board;

    // Verifica se é uma jogada (B ou W)
    const moveProp = node.data.B ? 'B' : (node.data.W ? 'W' : null);

    if (moveProp) {
        const sign = moveProp === 'B' ? 1 : -1;
        // Verifica se a coordenada existe (jogadas 'pass' ou vazias podem vir como array vazio ou string vazia)
        if (node.data[moveProp][0]) {
            const vertex = sgf.parseVertex(node.data[moveProp][0]);

            // 1. Tenta identificar o shape usando o tabuleiro ANTERIOR à jogada
            // O boardmatcher precisa do signMap, sinal da pedra e vértice
            const match = boardmatcher.findPatternInMove(board.signMap, sign, vertex);

            if (match) {
                const shapeName = match.pattern.name;
                // Exibe no terminal para você acompanhar
                console.log(`[Jogada ${moveProp}] Shape detectado: ${shapeName}`);

                // 2. Adiciona ao comentário do SGF
                const currentComment = node.data.C ? node.data.C[0] : "";

                // Evita duplicatas (se rodar o script várias vezes)
                if (!currentComment.includes(`[Shape: ${shapeName}]`)) {
                    // Se já tiver comentário, adiciona uma nova linha. Se não, cria.
                    const newComment = currentComment
                    ? `${currentComment}\n\n[Shape: ${shapeName}]`
                    : `[Shape: ${shapeName}]`;

                    node.data.C = [newComment];
                }
            }

            // 3. Atualiza o tabuleiro para o próximo passo (importante para a próxima jogada ver o desenho correto)
            nextBoard = board.makeMove(sign, vertex);
        }
    }

    // Continua para os filhos (próximas jogadas)
    if (node.children) {
        for (const child of node.children) {
            traverse(child, nextBoard);
        }
    }
}

// Inicializa o tabuleiro. Se não tiver tamanho definido, assume 19x19.
const sizeProp = rootNodes[0].data.SZ;
const size = sizeProp ? parseInt(sizeProp[0]) : 19;
const initialBoard = fromDimensions(size, size);

// Inicia a travessia a partir da raiz
traverse(rootNodes[0], initialBoard);

// Salva o novo arquivo
const outputFile = inputFile.replace('.sgf', '_com_shapes.sgf');
const newContent = sgf.stringify(rootNodes);

fs.writeFileSync(outputFile, newContent);
console.log(`\n---------------------------------------------------`);
console.log(`SUCESSO! Arquivo salvo como: ${outputFile}`);
console.log(`Agora abra este arquivo no Obsidian para ver os comentários.`);
