const { addQuizzes, listQuizzes } = require('./localStore');

const pergunta = (texto, opcoes, respostaCorreta) => ({
    pergunta: texto,
    opcoes,
    respostaCorreta
});

const quizzes = [
    {
        titulo: 'Matemática essencial', categoria: 'Matemática', perguntas: [
            pergunta('Quanto é 7 x 8?', ['54', '56', '64', '48'], 1),
            pergunta('Qual é a raiz quadrada de 144?', ['10', '11', '12', '14'], 2),
            pergunta('Quanto é 3/4 em porcentagem?', ['25%', '50%', '75%', '80%'], 2),
            pergunta('Qual é o perímetro de um quadrado de lado 5 cm?', ['10 cm', '15 cm', '20 cm', '25 cm'], 2),
            pergunta('Quanto é 2 elevado a 5?', ['10', '16', '25', '32'], 3),
            pergunta('Qual é o próximo número da sequência 2, 4, 8, 16?', ['20', '24', '30', '32'], 3),
            pergunta('Quanto é 15% de 200?', ['15', '20', '30', '35'], 2),
            pergunta('Um triângulo possui quantos lados?', ['2', '3', '4', '5'], 1),
            pergunta('Qual é o resultado de 45 - 18?', ['23', '27', '28', '33'], 1),
            pergunta('Qual fração representa metade?', ['1/2', '1/3', '2/3', '3/4'], 0)
        ]
    },
    {
        titulo: 'Língua Portuguesa', categoria: 'Português', perguntas: [
            pergunta('Qual é o plural de pão?', ['Pães', 'Pãos', 'Pãeses', 'Pões'], 0),
            pergunta('Qual palavra é um substantivo?', ['Correr', 'Bonito', 'Casa', 'Rapidamente'], 2),
            pergunta('Qual é o antônimo de claro?', ['Branco', 'Escuro', 'Brilhante', 'Limpo'], 1),
            pergunta('Em “A menina estudou”, qual é o verbo?', ['A', 'Menina', 'Estudou', 'Nenhum'], 2),
            pergunta('Qual palavra está escrita corretamente?', ['Excessão', 'Exceção', 'Esceção', 'Exessão'], 1),
            pergunta('Qual é o aumentativo de casa?', ['Casinha', 'Casebre', 'Casarão', 'Casual'], 2),
            pergunta('Qual sinal encerra uma pergunta?', ['Ponto final', 'Vírgula', 'Ponto de interrogação', 'Dois-pontos'], 2),
            pergunta('Qual palavra é um adjetivo?', ['Azul', 'Cantar', 'Mesa', 'Ontem'], 0),
            pergunta('“Nós viajaremos” está em qual tempo verbal?', ['Presente', 'Pretérito', 'Futuro', 'Infinitivo'], 2),
            pergunta('Qual é o sinônimo de feliz?', ['Triste', 'Alegre', 'Cansado', 'Nervoso'], 1)
        ]
    },
    {
        titulo: 'História do Brasil', categoria: 'História', perguntas: [
            pergunta('Em que ano ocorreu a Independência do Brasil?', ['1500', '1789', '1822', '1889'], 2),
            pergunta('Quem proclamou a Independência do Brasil?', ['Dom Pedro I', 'Tiradentes', 'Getúlio Vargas', 'José Bonifácio'], 0),
            pergunta('Qual foi a primeira capital do Brasil?', ['Brasília', 'Salvador', 'Rio de Janeiro', 'São Paulo'], 1),
            pergunta('A Lei Áurea aboliu qual prática?', ['Imigração', 'Escravidão', 'Monarquia', 'Industrialização'], 1),
            pergunta('Em que ano foi proclamada a República?', ['1822', '1850', '1888', '1889'], 3),
            pergunta('Quem foi Tiradentes?', ['Um imperador', 'Um líder da Inconfidência Mineira', 'Um presidente', 'Um navegador'], 1),
            pergunta('Qual povo construiu Machu Picchu?', ['Maia', 'Asteca', 'Inca', 'Egípcio'], 2),
            pergunta('A Revolução Industrial começou primeiro em qual país?', ['França', 'Inglaterra', 'Brasil', 'Portugal'], 1),
            pergunta('Qual civilização criou a democracia em Atenas?', ['Grega', 'Romana', 'Persa', 'Fenícia'], 0),
            pergunta('A chegada dos portugueses ao Brasil ocorreu em qual século?', ['Século XIII', 'Século XIV', 'Século XV', 'Século XVI'], 2)
        ]
    },
    {
        titulo: 'Geografia do mundo', categoria: 'Geografia', perguntas: [
            pergunta('Qual é o maior continente?', ['África', 'Europa', 'Ásia', 'Oceania'], 2),
            pergunta('Qual é o maior oceano?', ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], 2),
            pergunta('Qual é a capital do Brasil?', ['São Paulo', 'Brasília', 'Salvador', 'Belo Horizonte'], 1),
            pergunta('Em qual continente fica o Egito?', ['Ásia', 'África', 'Europa', 'Oceania'], 1),
            pergunta('Qual linha divide a Terra em hemisférios Norte e Sul?', ['Trópico de Câncer', 'Meridiano de Greenwich', 'Linha do Equador', 'Trópico de Capricórnio'], 2),
            pergunta('Qual é o maior país da América do Sul?', ['Argentina', 'Brasil', 'Peru', 'Colômbia'], 1),
            pergunta('Qual é o rio mais extenso do Brasil?', ['Rio São Francisco', 'Rio Paraná', 'Rio Amazonas', 'Rio Tietê'], 2),
            pergunta('O clima típico da região amazônica é:', ['Polar', 'Equatorial', 'Desértico', 'Mediterrâneo'], 1),
            pergunta('Qual é a capital da França?', ['Madri', 'Roma', 'Paris', 'Lisboa'], 2),
            pergunta('O que representa um mapa?', ['Somente o clima', 'Uma representação reduzida do espaço', 'Apenas fronteiras', 'Uma fotografia aérea obrigatória'], 1)
        ]
    },
    {
        titulo: 'Ciências naturais', categoria: 'Ciências', perguntas: [
            pergunta('Qual é o estado da água em forma de gelo?', ['Líquido', 'Gasoso', 'Sólido', 'Plasma'], 2),
            pergunta('Qual astro ilumina a Terra?', ['Lua', 'Sol', 'Marte', 'Vênus'], 1),
            pergunta('O que as plantas usam para produzir alimento?', ['Fotossíntese', 'Digestão', 'Combustão', 'Fermentação'], 0),
            pergunta('Qual gás é essencial para a respiração humana?', ['Oxigênio', 'Hélio', 'Hidrogênio', 'Metano'], 0),
            pergunta('Qual força nos mantém no chão?', ['Eletricidade', 'Gravidade', 'Pressão', 'Magnetismo'], 1),
            pergunta('A água ferve normalmente a quantos graus Celsius?', ['0', '50', '100', '212'], 2),
            pergunta('Qual instrumento mede a temperatura?', ['Barômetro', 'Termômetro', 'Régua', 'Bússola'], 1),
            pergunta('A reciclagem ajuda principalmente a:', ['Aumentar o desperdício', 'Reduzir impactos ambientais', 'Gastar mais água', 'Eliminar a energia solar'], 1),
            pergunta('Qual é a fonte de energia do vento?', ['Eólica', 'Nuclear', 'Geotérmica', 'Química'], 0),
            pergunta('Como chamamos a passagem do líquido para o gasoso?', ['Fusão', 'Evaporação', 'Solidificação', 'Condensação'], 1)
        ]
    },
    {
        titulo: 'Biologia e vida', categoria: 'Biologia', perguntas: [
            pergunta('Qual é a unidade básica dos seres vivos?', ['Átomo', 'Célula', 'Órgão', 'Tecido'], 1),
            pergunta('Qual órgão bombeia o sangue?', ['Pulmão', 'Cérebro', 'Coração', 'Estômago'], 2),
            pergunta('Qual sistema é responsável pela respiração?', ['Digestório', 'Respiratório', 'Nervoso', 'Esquelético'], 1),
            pergunta('Como são chamados os animais que produzem seu próprio alimento?', ['Heterótrofos', 'Autótrofos', 'Carnívoros', ' decompositores'], 1),
            pergunta('Qual molécula carrega a informação genética?', ['DNA', 'Água', 'Glicose', 'Oxigênio'], 0),
            pergunta('Qual é o maior órgão do corpo humano?', ['Fígado', 'Pele', 'Coração', 'Pulmão'], 1),
            pergunta('Animais que possuem coluna vertebral são:', ['Invertebrados', 'Vertebrados', 'Unicelulares', 'Aquáticos'], 1),
            pergunta('Qual processo permite que uma espécie gere descendentes?', ['Respiração', 'Reprodução', 'Circulação', 'Excreção'], 1),
            pergunta('As plantas absorvem água principalmente pelas:', ['Flores', 'Folhas', 'Raízes', 'Frutas'], 2),
            pergunta('Qual grupo inclui sapos e rãs?', ['Répteis', 'Anfíbios', 'Mamíferos', 'Aves'], 1)
        ]
    },
    {
        titulo: 'Física no cotidiano', categoria: 'Física', perguntas: [
            pergunta('Qual é a unidade de força no Sistema Internacional?', ['Watt', 'Joule', 'Newton', 'Volt'], 2),
            pergunta('A velocidade indica:', ['A massa de um corpo', 'A distância percorrida por tempo', 'A temperatura', 'A força elétrica'], 1),
            pergunta('Qual energia está associada ao movimento?', ['Cinética', 'Térmica', 'Nuclear', 'Sonora'], 0),
            pergunta('Qual aparelho mede a corrente elétrica?', ['Amperímetro', 'Termômetro', 'Higrômetro', 'Altímetro'], 0),
            pergunta('A luz se propaga mais rápido em:', ['Vácuo', 'Água', 'Vidro', 'Ar úmido'], 0),
            pergunta('Qual fenômeno explica o arco-íris?', ['Dispersão da luz', 'Gravidade', 'Combustão', 'Condução'], 0),
            pergunta('O som precisa de um meio material para:', ['Se propagar', 'Evaporar', 'Congelar', 'Brilhar'], 0),
            pergunta('Qual é a unidade de energia?', ['Joule', 'Metro', 'Pascal', 'Ampere'], 0),
            pergunta('Quando um corpo está parado, sua velocidade é:', ['1 m/s', 'Zero', '100 m/s', 'Negativa sempre'], 1),
            pergunta('O espelho plano produz uma imagem geralmente:', ['Real e invertida', 'Virtual e direita', 'Maior e real', 'Sem imagem'], 1)
        ]
    },
    {
        titulo: 'Química básica', categoria: 'Química', perguntas: [
            pergunta('Qual é o símbolo químico do oxigênio?', ['Ox', 'O', 'Og', 'O2'], 1),
            pergunta('A água é formada por hidrogênio e:', ['Carbono', 'Oxigênio', 'Nitrogênio', 'Ferro'], 1),
            pergunta('Qual é o pH de uma solução neutra?', ['0', '5', '7', '14'], 2),
            pergunta('O sal de cozinha é conhecido como:', ['HCl', 'NaCl', 'CO2', 'H2O'], 1),
            pergunta('Qual estado da matéria possui volume e forma definidos?', ['Sólido', 'Líquido', 'Gasoso', 'Plasma'], 0),
            pergunta('O que indica o número atômico?', ['Número de prótons', 'Número de moléculas', 'Massa da solução', 'Temperatura'], 0),
            pergunta('Qual gás é liberado na respiração humana?', ['Dióxido de carbono', 'Oxigênio puro', 'Hélio', 'Ozônio'], 0),
            pergunta('A ferrugem é resultado de uma reação envolvendo principalmente:', ['Ferro e oxigênio', 'Ouro e água', 'Prata e sal', 'Cobre e gelo'], 0),
            pergunta('Qual partícula possui carga negativa?', ['Próton', 'Nêutron', 'Elétron', 'Núcleo'], 2),
            pergunta('A tabela periódica organiza:', ['Planetas', 'Elementos químicos', 'Animais', 'Tipos de rochas'], 1)
        ]
    },
    {
        titulo: 'Inglês para iniciantes', categoria: 'Inglês', perguntas: [
            pergunta('Qual é a tradução de “book”?', ['Mesa', 'Livro', 'Caneta', 'Janela'], 1),
            pergunta('Como se diz “bom dia” em inglês?', ['Good night', 'Good afternoon', 'Good morning', 'Goodbye'], 2),
            pergunta('Qual é o plural de “child”?', ['Childs', 'Children', 'Childes', 'Childrens'], 1),
            pergunta('O que significa “blue”?', ['Verde', 'Azul', 'Preto', 'Amarelo'], 1),
            pergunta('Complete: “I ___ Brazilian.”', ['am', 'is', 'are', 'be'], 0),
            pergunta('Qual é o oposto de “hot”?', ['Warm', 'Cold', 'Big', 'Fast'], 1),
            pergunta('Como se diz “obrigado” em inglês?', ['Please', 'Thanks', 'Sorry', 'Welcome'], 1),
            pergunta('Qual palavra significa “casa”?', ['House', 'Horse', 'Mouse', 'School'], 0),
            pergunta('Complete: “She ___ a student.”', ['am', 'are', 'is', 'be'], 2),
            pergunta('O que significa “water”?', ['Fogo', 'Terra', 'Água', 'Ar'], 2)
        ]
    },
    {
        titulo: 'Literatura brasileira', categoria: 'Literatura', perguntas: [
            pergunta('Quem escreveu “Dom Casmurro”?', ['Machado de Assis', 'José de Alencar', 'Clarice Lispector', 'Carlos Drummond'], 0),
            pergunta('“Iracema” foi escrito por:', ['Jorge Amado', 'José de Alencar', 'Cecília Meireles', 'Graciliano Ramos'], 1),
            pergunta('Qual gênero apresenta versos e estrofes?', ['Poema', 'Notícia', 'Receita', 'Manual'], 0),
            pergunta('Quem escreveu “Vidas Secas”?', ['Graciliano Ramos', 'Monteiro Lobato', 'Manuel Bandeira', 'Lima Barreto'], 0),
            pergunta('A Semana de Arte Moderna ocorreu em:', ['1910', '1922', '1945', '1964'], 1),
            pergunta('Qual autora escreveu “A Hora da Estrela”?', ['Clarice Lispector', 'Rachel de Queiroz', 'Lygia Fagundes Telles', 'Cora Coralina'], 0),
            pergunta('Narrador é quem:', ['Compra o livro', 'Conta a história', 'Desenha a capa', 'Publica a obra'], 1),
            pergunta('Qual é uma característica da fábula?', ['Animais com comportamento humano', 'Somente fatos reais', 'Ausência de moral', 'Texto sempre científico'], 0),
            pergunta('Quem escreveu “O Auto da Compadecida”?', ['Ariano Suassuna', 'Érico Veríssimo', 'João Cabral', 'Paulo Leminski'], 0),
            pergunta('Metáfora é uma figura de linguagem baseada em:', ['Comparação implícita', 'Repetição de sons', 'Exagero numérico', 'Pergunta direta'], 0)
        ]
    },
    {
        titulo: 'Tecnologia e internet', categoria: 'Tecnologia', perguntas: [
            pergunta('O que significa a sigla CPU?', ['Central Processing Unit', 'Computer Personal User', 'Control Program Unit', 'Central Program Utility'], 0),
            pergunta('Qual dispositivo é usado para armazenar arquivos?', ['HD', 'Monitor', 'Teclado', 'Microfone'], 0),
            pergunta('O que é um navegador?', ['Programa para acessar sites', 'Peça de impressão', 'Tipo de cabo', 'Sistema de som'], 0),
            pergunta('Qual prática protege melhor uma conta?', ['Usar senha forte e autenticação em dois fatores', 'Repetir a senha', 'Compartilhar o código', 'Desativar atualizações'], 0),
            pergunta('O que é um arquivo PDF?', ['Formato de documento', 'Tipo de teclado', 'Rede social', 'Linguagem de programação'], 0),
            pergunta('Qual linguagem é usada para estruturar páginas web?', ['HTML', 'MP3', 'JPEG', 'USB'], 0),
            pergunta('O que é computação em nuvem?', ['Uso de serviços e dados pela internet', 'Limpeza do computador', 'Impressão 3D', 'Desligamento automático'], 0),
            pergunta('Qual é uma boa prática contra phishing?', ['Verificar o endereço do remetente e do site', 'Clicar em qualquer link', 'Enviar sua senha', 'Ignorar o endereço'], 0),
            pergunta('O que significa fazer backup?', ['Criar uma cópia de segurança', 'Apagar tudo', 'Aumentar o brilho', 'Trocar o monitor'], 0),
            pergunta('Qual destes é um sistema operacional?', ['Linux', 'HTML', 'Wi-Fi', 'Bluetooth'], 0)
        ]
    },
    {
        titulo: 'Artes e cultura', categoria: 'Artes', perguntas: [
            pergunta('Quais são as cores primárias tradicionais?', ['Vermelho, amarelo e azul', 'Verde, laranja e roxo', 'Preto, branco e cinza', 'Rosa, marrom e dourado'], 0),
            pergunta('Quem pintou a Mona Lisa?', ['Van Gogh', 'Leonardo da Vinci', 'Picasso', 'Michelangelo'], 1),
            pergunta('Qual arte usa o corpo e o movimento como expressão?', ['Dança', 'Escultura', 'Fotografia', 'Arquitetura'], 0),
            pergunta('O teatro combina principalmente:', ['Atuação e encenação', 'Cálculos e mapas', 'Experimentos e fórmulas', 'Plantio e colheita'], 0),
            pergunta('Qual instrumento possui teclas brancas e pretas?', ['Violino', 'Piano', 'Flauta', 'Tambor'], 1),
            pergunta('A escultura é uma arte geralmente:', ['Tridimensional', 'Somente sonora', 'Apenas digital', 'Feita de palavras'], 0),
            pergunta('Qual manifestação cultural é típica do Brasil?', ['Samba', 'Ópera de Pequim', 'Flamenco russo', 'Kabuki brasileiro'], 0),
            pergunta('O cinema é uma linguagem baseada principalmente em:', ['Imagens em movimento', 'Apenas esculturas', 'Mapas antigos', 'Cálculos algébricos'], 0),
            pergunta('Qual material é comum na aquarela?', ['Tinta diluída em água', 'Cimento seco', 'Metal derretido', 'Areia prensada'], 0),
            pergunta('O museu é um espaço dedicado a:', ['Preservar e apresentar obras e objetos', 'Vender alimentos', 'Produzir combustíveis', 'Medir terremotos'], 0)
        ]
    },
    {
        titulo: 'Filosofia para pensar', categoria: 'Filosofia', perguntas: [
            pergunta('O que a filosofia busca principalmente?', ['Refletir criticamente sobre questões fundamentais', 'Decorar listas', 'Prever o clima', 'Produzir alimentos'], 0),
            pergunta('Quem é associado à frase “Só sei que nada sei”?', ['Sócrates', 'Aristóteles', 'Platão', 'Epicuro'], 0),
            pergunta('A ética estuda principalmente:', ['Ações e valores morais', 'Formas geométricas', 'Reações químicas', 'Movimentos planetários'], 0),
            pergunta('A lógica ajuda a analisar:', ['Argumentos e raciocínios', 'Cores de pinturas', 'Tipos de solo', 'Sons musicais'], 0),
            pergunta('Platão foi discípulo de:', ['Sócrates', 'Descartes', 'Kant', 'Nietzsche'], 0),
            pergunta('O conhecimento baseado na experiência é chamado de:', ['Empírico', 'Mítico', 'Imaginário', 'Aleatório'], 0),
            pergunta('A palavra filosofia pode ser entendida como:', ['Amor à sabedoria', 'Medo da ciência', 'Busca por riqueza', 'Arte de guerrear'], 0),
            pergunta('Qual tema pertence à filosofia política?', ['Justiça e organização da sociedade', 'Fotossíntese', 'Gramática', 'Pressão atmosférica'], 0),
            pergunta('O pensamento crítico exige:', ['Analisar razões e evidências', 'Aceitar tudo sem questionar', 'Evitar perguntas', 'Repetir opiniões'], 0),
            pergunta('Aristóteles foi aluno de:', ['Platão', 'Sócrates diretamente', 'Cícero', 'Sêneca'], 0)
        ]
    },
    {
        titulo: 'Educação financeira', categoria: 'Educação Financeira', perguntas: [
            pergunta('O que é um orçamento?', ['Planejamento de receitas e despesas', 'Uma conta bancária', 'Um tipo de imposto', 'Uma compra parcelada'], 0),
            pergunta('Guardar parte da renda é uma forma de:', ['Poupar', 'Endividar', 'Consumir', 'Investir sem planejar'], 0),
            pergunta('Juros são:', ['Um custo ou rendimento pelo uso do dinheiro', 'Um tipo de salário', 'Uma moeda', 'Um documento pessoal'], 0),
            pergunta('O que é reserva de emergência?', ['Dinheiro guardado para imprevistos', 'Compra por impulso', 'Dívida mensal', 'Imposto obrigatório'], 0),
            pergunta('Antes de comprar, é importante:', ['Comparar preços e avaliar a necessidade', 'Ignorar o orçamento', 'Usar sempre crédito', 'Comprar sem pesquisar'], 0),
            pergunta('Diversificar investimentos significa:', ['Distribuir recursos em diferentes opções', 'Colocar tudo em uma opção', 'Não guardar dinheiro', 'Gastar o salário inteiro'], 0),
            pergunta('O cartão de crédito deve ser usado considerando:', ['A capacidade de pagar a fatura', 'A renda de outra pessoa', 'O limite como dinheiro extra', 'A ausência de planejamento'], 0),
            pergunta('Inflação é:', ['Aumento geral dos preços', 'Queda de todos os salários', 'Um tipo de investimento', 'Uma conta de poupança'], 0),
            pergunta('Uma dívida saudável deve ser:', ['Planejada e compatível com a renda', 'Sempre maior que a renda', 'Feita sem conhecer os juros', 'Mantida em segredo'], 0),
            pergunta('Meta financeira é:', ['Um objetivo de dinheiro com prazo e valor', 'Uma compra sem finalidade', 'Uma taxa bancária', 'Um empréstimo automático'], 0)
        ]
    },
    {
        titulo: 'Saúde e bem-estar', categoria: 'Saúde', perguntas: [
            pergunta('Uma alimentação equilibrada deve incluir:', ['Variedade de nutrientes', 'Apenas doces', 'Somente bebidas', 'Uma única fruta'], 0),
            pergunta('A hidratação é importante porque a água:', ['Participa de funções do organismo', 'Substitui todo alimento', 'Elimina a necessidade de sono', 'Aumenta a temperatura sempre'], 0),
            pergunta('Qual hábito ajuda na saúde do sono?', ['Manter horários regulares', 'Usar telas até dormir', 'Tomar estimulantes à noite', 'Dormir em horários aleatórios'], 0),
            pergunta('A atividade física regular pode:', ['Contribuir para o bem-estar', 'Eliminar toda doença', 'Substituir consultas', 'Impedir o descanso'], 0),
            pergunta('Lavar as mãos ajuda a:', ['Reduzir a transmissão de microrganismos', 'Aumentar a poluição', 'Substituir vacinas', 'Evitar toda alergia'], 0),
            pergunta('A saúde mental envolve:', ['Emoções, pensamentos e relações', 'Apenas exercícios físicos', 'Somente alimentação', 'Exclusivamente dinheiro'], 0),
            pergunta('Vacinas ajudam o corpo a:', ['Desenvolver proteção contra doenças', 'Substituir água', 'Aumentar a sede', 'Eliminar a necessidade de higiene'], 0),
            pergunta('Qual profissional acompanha a saúde dos dentes?', ['Dentista', 'Arquiteto', 'Geógrafo', 'Músico'], 0),
            pergunta('Para evitar acidentes, é importante:', ['Observar riscos e seguir orientações', 'Ignorar sinalizações', 'Correr em locais perigosos', 'Usar equipamentos de qualquer jeito'], 0),
            pergunta('Descanso adequado contribui para:', ['Recuperação do corpo e da mente', 'Aumento permanente do estresse', 'Substituição de refeições', 'Redução da hidratação'], 0)
        ]
    },
    {
        titulo: 'Meio ambiente', categoria: 'Meio Ambiente', perguntas: [
            pergunta('O que é biodiversidade?', ['Variedade de seres vivos', 'Quantidade de prédios', 'Velocidade dos ventos', 'Nível de uma maré'], 0),
            pergunta('O desmatamento provoca:', ['Perda de habitats', 'Aumento da biodiversidade sempre', 'Formação de geleiras', 'Redução da erosão sempre'], 0),
            pergunta('Qual atitude reduz o consumo de água?', ['Fechar a torneira ao escovar os dentes', 'Deixar vazamentos', 'Lavar calçadas com mangueira', 'Tomar banhos mais longos'], 0),
            pergunta('A coleta seletiva separa:', ['Materiais recicláveis por tipo', 'Somente alimentos quentes', 'Pessoas por idade', 'Água doce e salgada'], 0),
            pergunta('O efeito estufa natural ajuda a:', ['Manter a temperatura adequada da Terra', 'Eliminar a atmosfera', 'Resfriar o Sol', 'Parar o ciclo da água'], 0),
            pergunta('Energia solar vem:', ['Da radiação do Sol', 'Do movimento das marés somente', 'Da queima de plástico', 'Do interior de computadores'], 0),
            pergunta('Uma espécie ameaçada é aquela que:', ['Corre risco de desaparecer', 'Vive apenas em cidades', 'Sempre está aumentando', 'Não pertence a nenhum ecossistema'], 0),
            pergunta('Compostagem transforma resíduos orgânicos em:', ['Adubo', 'Plástico', 'Metal', 'Combustível fóssil'], 0),
            pergunta('Qual é um recurso natural renovável?', ['Luz solar', 'Petróleo', 'Carvão mineral', 'Gás natural'], 0),
            pergunta('Preservar florestas ajuda a proteger:', ['Solo, água e biodiversidade', 'Apenas estradas', 'Somente prédios', 'Apenas aparelhos eletrônicos'], 0)
        ]
    }
];

async function semearQuizzes() {
    const quantidade = listQuizzes().length;
    if (quantidade > 0) return;

    addQuizzes(quizzes);
    console.log(`${quizzes.length} quizzes iniciais criados.`);
}

module.exports = { semearQuizzes };
