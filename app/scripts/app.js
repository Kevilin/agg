(function($) {
    var modulo = angular.module('appModule', ['ui.bootstrap', 'chart.js']);

    modulo.controller('AppCtrl', function($scope) {
        $scope.taxaCrossover = 70;
        $scope.taxaMutacao = 1;
        $scope.elite = true;
        $scope.accordionAberto = true;
        $scope.tamanhoPopulacao = 30;
        $scope.quantidadeGeracoes = 50;
        $scope.geracao = [];
        $scope.labels = [1, 2, 3, 4, 5, 6,7];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40]
        ];
        $scope.series = ["Valor na funcao 5.x + y^2 + w + 3^3"];


        function Individuo(xbin, ybin, wbin, zbin) {
            this.xbin = xbin.toString();
            this.xdecimal = parseInt(xbin, 2);
            this.ybin = ybin.toString();
            this.ydecimal = parseInt(ybin, 2);
            this.wbin = xbin.toString();
            this.wdecimal = parseInt(wbin, 2);
            this.zbin = zbin.toString();
            this.zdecimal = parseInt(zbin, 2);
            this.aptidao = calculaFuncao(this.xdecimal, this.ydecimal, this.wdecimal, this.zdecimal);
            //this.mutado = false;
            //this.crossover = false;
        };

//Transforma string binarias em string binarias de 5 digitos
        String.prototype.to5digit = function() {
            var bin = this;
            if (bin.length<5){
                while (bin.length<5){
                    if (bin.charAt(0) == "-"){
                        var signal = bin.charAt(0);
                        bin = signal + "0" + bin.substr(1, bin.length-1);

                    } else {
                        bin = "0" + bin;
                    }
                }
            }
            return bin;
        };

//Extensao da classe Array para clonar arrays
        Array.prototype.clone = function() {
            return this.slice(0);
        };

//Gera um inteiro limitado pelos valores de min e max inclusos
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

//Gera a populacao iniciao de 4 individuoes com valores decimais de -10 ate 10
        $scope.gerarPrimeiraGeracao = function gerarPopulacaoInicial() {
            $scope.geracao[0] = {
                descricao: "Geração Inicial",
                populacao: new Array(this.tamanhoPopulacao)

            };
            for(var i = 0; i<this.tamanhoPopulacao; i++) {
                //var valorAleatorio = getRandomInt(-10, 10);
                $scope.geracao[0].populacao[i] = new Individuo(getRandomInt(1,10).toString(2).to5digit(),getRandomInt(1,10).toString(2).to5digit(),getRandomInt(1,10).toString(2).to5digit(),getRandomInt(1,10).toString(2).to5digit());
            }
            gerarDadosGrafico(0);
        };

//Tenta gerar novos descendentes
       $scope.gerarDescendentes =  function gerarDescedentes(numeroGeracao) {

           var iPai = torneio(numeroGeracao);
           var iMae = torneio(numeroGeracao);


           //Verifica se ocorrera o crossover
            if (getRandomInt(0,100) < $scope.taxaCrossover) {
                $scope.crossover(iPai, iMae, numeroGeracao);
            } else {
                $scope.geracao[numeroGeracao+1] = {
                    descricao: "Geração " + (numeroGeracao+1),
                    populacao: new Array($scope.tamanhoPopulacao)
                };
                $scope.geracao[numeroGeracao+1].populacao = $scope.geracao[numeroGeracao].populacao.clone()
            }

            //Verifica se ocorrera mutacao
            if(getRandomInt(0, 100) < $scope.taxaMutacao) {
                $scope.mutacao(iPai, iMae, numeroGeracao);
            }

           gerarDadosGrafico(numeroGeracao+1);
        };

//Aplica o crossover baseando-se na numero da geracao base e os indices do pai e da mae a serem combinados
        $scope.crossover = function crossover(iPai, iMae, numeroGeracao) {
            var populacaoBase = $scope.geracao[numeroGeracao].populacao.clone();
            $scope.geracao[numeroGeracao+1] = {
                descricao: "Geração " + (numeroGeracao+1),
                populacao: populacaoBase
            }

            var pai = $scope.geracao[numeroGeracao+1].populacao[iPai];
            var mae = $scope.geracao[numeroGeracao+1].populacao[iMae];

            var filho1 = new Individuo(pai.bin.substr(0,3).concat(mae.bin.substr(3,2)),pai.bin.substr(0,3).concat(mae.bin.substr(3,2)),pai.bin.substr(0,3).concat(mae.bin.substr(3,2)),pai.bin.substr(0,3).concat(mae.bin.substr(3,2)));
            var filho2 = new Individuo(mae.bin.substr(0,3).concat(pai.bin.substr(3,2)),mae.bin.substr(0,3).concat(pai.bin.substr(3,2)),mae.bin.substr(0,3).concat(pai.bin.substr(3,2)),mae.bin.substr(0,3).concat(pai.bin.substr(3,2)));

            if ($scope.elite){
                var individuos = [pai, mae, filho1, filho2];
                individuos.sort(compare);
                $scope.geracao[numeroGeracao+1].populacao[iPai] = individuos[0];
                $scope.geracao[numeroGeracao+1].populacao[iMae] = individuos[1];
                var c = 1;
            }else {
                //adicionna os filhos na geracao criada no lugar de seus pais
                $scope.geracao[numeroGeracao+1].populacao[iPai] = filho1;
                $scope.geracao[numeroGeracao+1].populacao[iMae] = filho2;
            }
        };

//Aplica a mutacao baseando-se nos individuos do indice informado na geracao informada
        $scope.mutacao = function mutacao(iIndividuo1, iIndividuo2, numeroGeracao) {
            //Obtem os indices com base nos indices e geracao
            var individuo1 = $scope.geracao[numeroGeracao+1].populacao[iIndividuo1];
            var individuo2 = $scope.geracao[numeroGeracao+1].populacao[iIndividuo2];

            //Muta os individuos
            individuo1 = new Individuo(mutar(individuo1.bin),mutar(individuo1.bin),mutar(individuo1.bin),mutar(individuo1.bin));
            individuo2 = new Individuo(mutar(individuo2.bin),mutar(individuo2.bin),mutar(individuo2.bin),mutar(individuo2.bin));

            //Coloca os individuos mutados na geracao
            $scope.geracao[numeroGeracao+1].populacao[iIndividuo1] = individuo1;
            $scope.geracao[numeroGeracao+1].populacao[iIndividuo2] = individuo2;
        };

//Retorna um binario mutando um indice aleatorio
        function mutar(bin) {
            var binMutado;
            var indiceMutado = getRandomInt(0, 4);
            if (indiceMutado == 0) {
                if (bin[indiceMutado] == "-") {
                    binMutado = "0".concat(bin.substr(1, 4));
                } else {
                    binMutado = "-".concat(bin.substr(1, 4));
                }
            } else {

                if (indiceMutado == 4) {
                    if (bin[indiceMutado] == "0") {
                        binMutado = bin.substr(0, indiceMutado) + "1";
                    } else {
                        binMutado = bin.substr(0, indiceMutado) + "0";
                    }
                }else {
                    if (bin[indiceMutado] == "0") {
                        binMutado = bin.substr(0, indiceMutado) + "1" + bin.substr(indiceMutado + 1);
                    } else {
                        binMutado = bin.substr(0, indiceMutado) + "0" + bin.substr(indiceMutado + 1);
                    }
                }
            }

            return binMutado;
        };

        $scope.criarGeracoes = function criarGeracoes(quantidadeGeracoes) {
            for (var i = 0; i<quantidadeGeracoes-1; i++) {
                $scope.gerarDescendentes(i);
            }
        };

        function calculaFuncao(x, y, w,z) {
            return (5*x) + (y**2) + w + (z**3);
        };

        function    torneio(numeroGeracao) {
            var iIndividuo1 = getRandomInt(0, $scope.tamanhoPopulacao-1);
            var iIndividuo2 = getRandomInt(0, $scope.tamanhoPopulacao-1);
            var individuo1 = $scope.geracao[numeroGeracao].populacao[iIndividuo1];
            var individuo2 = $scope.geracao[numeroGeracao].populacao[iIndividuo2];

            if (individuo1.aptidao < individuo2.aptidao) {
                return iIndividuo1;
            } else {
                return iIndividuo2;
            }
        };

        function gerarDadosGrafico(numeroGeracao) {
            var decimais = new Array();
            var resultadosNaFuncao = new Array();
            var pop = $scope.geracao[numeroGeracao].populacao;
            for(var i = 0; i< pop.length; i++) {
                decimais.push(pop[i].decimal);
                resultadosNaFuncao.push(pop[i].aptidao);
            }
            $scope.geracao[numeroGeracao].decimais = decimais;
            $scope.geracao[numeroGeracao].valoresNaFuncao = new Array();
            $scope.geracao[numeroGeracao].valoresNaFuncao.push(resultadosNaFuncao);

        };

        //Funcao de comparacao para ordenar com base na aptidao menor, onde aptidao = valor da funcao
        function compare(a,b) {
            if (a.aptidao < b.aptidao){
                return -1;
            }
            if (a.aptidao > b.aptidao){
                return 1;
            }
            return 0;
        };

        function limparGeracao() {
          $scope.geracao = new Array(tamanhoPopulacao);
        };

        $scope.algoritmoGenetico = function algoritmoGenetico() {
            limparGeracao();
            $scope.gerarPrimeiraGeracao();
            $scope.criarGeracoes($scope.quantidadeGeracoes);
        };


    });

})();