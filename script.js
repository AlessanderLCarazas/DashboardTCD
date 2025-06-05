document.addEventListener('DOMContentLoaded', function () {
    let allData = [];
    let selectedCountries = [];
    let selectedContinent = null;

    d3.csv('owid-covid-data-procesado.csv').then(function (data) {
        allData = data.map(d => {
            d.date = new Date(d.date);
            return d;
        });

        const continents = [...new Set(data.map(d => d.continent))].filter(c => c);
        const continentTags = d3.select('#continent-tags');

        continentTags.selectAll('span')
            .data(continents)
            .enter()
            .append('span')
            .text(d => d)
            .attr('class', 'tag')
            .on('click', function (event, d) {
                const isSelected = !d3.select(this).classed('selected');
                continentTags.selectAll('span').classed('selected', false);
                if (isSelected) {
                    d3.select(this).classed('selected', true);
                    selectedContinent = d;
                    updateCountryTags(selectedContinent);
                } else {
                    selectedContinent = null;
                    updateCountryTags(null);
                }
            });

        function updateCountryTags(continent) {
            const countryTags = d3.select('#country-tags');
            countryTags.selectAll('*').remove();

            let countries = continent
                ? [...new Set(data.filter(d => d.continent === continent).map(d => d.location))]
                : [];

            countryTags.selectAll('span')
                .data(countries)
                .enter()
                .append('span')
                .text(d => d)
                .attr('class', 'tag')
                .on('click', function (event, d) {
                    d3.select(this).classed('selected', !d3.select(this).classed('selected'));
                    updateSelectedCountries();
                    updateDataByDateRange(startPos, endPos, timelineWidth);
                });

            selectedCountries = [];
            updateSelectedCountries();
        }

        function updateSelectedCountries() {
            selectedCountries = [];
            d3.selectAll('#country-tags .tag.selected').each(function () {
                selectedCountries.push(d3.select(this).text());
            });
            d3.select('#selected-countries').text(selectedCountries.length > 0 ? selectedCountries.join(', ') : 'Ninguno');
        }

        function updateCharts(data) {
            createCasesVsDeathsChart(data);
            createNewCasesChart(data);
            createNewDeathsChart(data);
            createVaccinationsChart(data);
            createTotalCasesChart(data);
            createTotalDeathsChart(data);
            createVaccinationRateChart(data);
            createDeathRateChart(data);
            createRecoveryRateChart(data);
            createPopulationImpactChart(data);
            createPropagationChart(data);
        }

        function createCasesVsDeathsChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#cases-vs-deaths-chart').selectAll('*').remove();

            const svg = d3.select('#cases-vs-deaths-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_cases) * 1.2])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_deaths) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Casos Totales');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Muertes Totales');

            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.total_cases))
                .attr('cy', d => y(d.total_deaths))
                .attr('r', 5)
                .style('fill', 'steelblue');
        }

        function createNewCasesChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#new-cases-chart').selectAll('*').remove();

            const svg = d3.select('#new-cases-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.new_cases) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.new_cases)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Nuevos Casos');
        }

        function createNewDeathsChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#new-deaths-chart').selectAll('*').remove();

            const svg = d3.select('#new-deaths-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.new_deaths) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.new_deaths)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Nuevas Muertes');
        }

        function createVaccinationsChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#vaccinations-chart').selectAll('*').remove();

            const svg = d3.select('#vaccinations-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_vaccinations) * 1.2])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.people_fully_vaccinated) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Vacunaciones Totales');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Personas Totalmente Vacunadas');

            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.total_vaccinations))
                .attr('cy', d => y(d.people_fully_vaccinated))
                .attr('r', 5)
                .style('fill', 'steelblue');
        }

        function createTotalCasesChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#total-cases-chart').selectAll('*').remove();

            const svg = d3.select('#total-cases-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_cases) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'green')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.total_cases)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Casos Totales');
        }

        function createTotalDeathsChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#total-deaths-chart').selectAll('*').remove();

            const svg = d3.select('#total-deaths-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_deaths) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.total_deaths)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Muertes Totales');
        }

        function createVaccinationRateChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#vaccination-rate-chart').selectAll('*').remove();

            const svg = d3.select('#vaccination-rate-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.people_fully_vaccinated_per_hundred || 0) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'purple')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.people_fully_vaccinated_per_hundred || 0)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Tasa de Vacunación (%)');
        }

        function createDeathRateChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#death-rate-chart').selectAll('*').remove();

            const svg = d3.select('#death-rate-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.new_deaths_smoothed_per_million || 0) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'orange')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.new_deaths_smoothed_per_million || 0)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Tasa de Mortalidad (por millón)');
        }

        function createRecoveryRateChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#recovery-rate-chart').selectAll('*').remove();

            const svg = d3.select('#recovery-rate-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            const recoveryRateData = data.map(d => ({
                date: d.date,
                recoveryRate: d.total_cases > 0 ? ((d.total_cases - d.total_deaths) / d.total_cases) * 100 : 0
            }));

            svg.append('path')
                .datum(recoveryRateData)
                .attr('fill', 'none')
                .attr('stroke', 'blue')
                .attr('stroke-width', 1.5)
                .attr('d', d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.recoveryRate)));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Tasa de Recuperación (%)');
        }

        function createPopulationImpactChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 550 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;

            d3.select('#population-impact-chart').selectAll('*').remove();

            const svg = d3.select('#population-impact-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.population)])
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_cases)])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => x(d.population))
                .attr('cy', d => y(d.total_cases))
                .attr('r', 5)
                .style('fill', 'brown');

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Población');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Impacto de Casos Totales');
        }

        function createPropagationChart(data) {
            const margin = { top: 40, right: 40, bottom: 60, left: 60 };
            const width = 900 - margin.left - margin.right;
            const height = 450 - margin.top - margin.bottom;

            d3.select('#propagation-chart').selectAll('*').remove();

            const svg = d3.select('#propagation-chart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.date))
                .range([0, width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.total_cases) * 1.2])
                .range([height, 0]);

            svg.append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(10));

            svg.append('g')
                .call(d3.axisLeft(y).ticks(10));

            svg.append('text')
                .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
                .style('text-anchor', 'middle')
                .text('Fecha');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (height / 2))
                .attr('dy', '1em')
                .style('text-anchor', 'middle')
                .text('Casos Totales');

            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.total_cases));

            const path = svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', line);

            const totalLength = path.node().getTotalLength();

            path
                .attr('stroke-dasharray', totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(5000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        }

        function updateTable(data) {
            const container = d3.select('#data-container');
            container.selectAll('table').remove();
            container.selectAll('p').remove();

            if (data.length === 0) {
                container.append('p').text('No hay datos disponibles para los filtros seleccionados.');
                return;
            }

            const table = container.append('table').attr('class', 'data-table');
            const thead = table.append('thead');
            const tbody = table.append('tbody');

            thead.append('tr')
                .selectAll('th')
                .data(Object.keys(data[0]))
                .enter()
                .append('th')
                .text(d => d);

            const rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

            rows.selectAll('td')
                .data(row => Object.values(row))
                .enter()
                .append('td')
                .text(d => d instanceof Date ? d.toISOString().split('T')[0] : d);
        }

        function updateDataByDateRange(startPos, endPos, timelineWidth) {
            const startDate = new Date(2020, 0, 1);
            const endDate = new Date(2025, 0, 1);

            const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            const startMonth = Math.floor((startPos / timelineWidth) * totalMonths);
            const endMonth = Math.floor((endPos / timelineWidth) * totalMonths);

            const startFilterDate = new Date(startDate.getFullYear(), startDate.getMonth() + startMonth, 1);
            const endFilterDate = new Date(startDate.getFullYear(), startDate.getMonth() + endMonth, 0);

            let filteredData = [];

            if (selectedCountries.length > 0) {
                filteredData = allData.filter(d => {
                    return selectedCountries.includes(d.location) &&
                        d.date >= startFilterDate &&
                        d.date <= endFilterDate;
                });
            }

            updateTable(filteredData);
            updateCharts(filteredData);
        }

        let startPos = 0;
        let endPos = 0;
        let timelineWidth = 0;

        function setupTimeline() {
            const startBar = document.getElementById('start-bar');
            const endBar = document.getElementById('end-bar');
            const startLabel = document.getElementById('start-label');
            const endLabel = document.getElementById('end-label');
            const timeline = document.querySelector('.timeline');
            timelineWidth = timeline.offsetWidth;

            startPos = 0;
            endPos = timelineWidth;

            startBar.style.left = startPos + 'px';
            endBar.style.left = endPos + 'px';
            startLabel.style.left = startPos + 'px';
            endLabel.style.left = endPos + 'px';

            updateDateLabels(startPos, endPos, timelineWidth);

            let isDraggingStart = false;
            let isDraggingEnd = false;

            startBar.addEventListener('mousedown', function (e) {
                isDraggingStart = true;
                e.preventDefault();
            });

            endBar.addEventListener('mousedown', function (e) {
                isDraggingEnd = true;
                e.preventDefault();
            });

            document.addEventListener('mousemove', function (e) {
                if (!isDraggingStart && !isDraggingEnd) return;

                const rect = timeline.getBoundingClientRect();
                let pos = e.clientX - rect.left;
                pos = Math.max(0, Math.min(pos, timelineWidth));

                if (isDraggingStart) {
                    startPos = Math.min(pos, endPos - 10);
                    startBar.style.left = startPos + 'px';
                }

                if (isDraggingEnd) {
                    endPos = Math.max(pos, startPos + 10);
                    endBar.style.left = endPos + 'px';
                }

                startLabel.style.left = startPos + 'px';
                endLabel.style.left = endPos + 'px';

                updateDateLabels(startPos, endPos, timelineWidth);
                updateDataByDateRange(startPos, endPos, timelineWidth);
            });

            document.addEventListener('mouseup', function () {
                isDraggingStart = false;
                isDraggingEnd = false;
            });
        }

        function updateDateLabels(startPos, endPos, timelineWidth) {
            const startDate = new Date(2020, 0, 1);
            const endDate = new Date(2025, 0, 1);

            const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            const startMonth = Math.floor((startPos / timelineWidth) * totalMonths);
            const endMonth = Math.floor((endPos / timelineWidth) * totalMonths);

            const startDisplayDate = new Date(startDate.getFullYear(), startDate.getMonth() + startMonth, 1);
            const endDisplayDate = new Date(startDate.getFullYear(), startDate.getMonth() + endMonth, 0);

            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

            const startLabel = document.getElementById('start-label');
            const endLabel = document.getElementById('end-label');

            startLabel.textContent = `${monthNames[startDisplayDate.getMonth()]} ${startDisplayDate.getFullYear()}`;
            endLabel.textContent = `${monthNames[endDisplayDate.getMonth()]} ${endDisplayDate.getFullYear()}`;
        }

        d3.select('#reset-button').on('click', function () {
            d3.selectAll('.tag').classed('selected', false);
            selectedCountries = [];
            selectedContinent = null;
            updateSelectedCountries();

            startPos = 0;
            endPos = timelineWidth;
            document.getElementById('start-bar').style.left = startPos + 'px';
            document.getElementById('end-bar').style.left = endPos + 'px';
            document.getElementById('start-label').style.left = startPos + 'px';
            document.getElementById('end-label').style.left = endPos + 'px';
            updateDateLabels(startPos, endPos, timelineWidth);

            updateDataByDateRange(startPos, endPos, timelineWidth);
        });

        setupTimeline();
        updateDataByDateRange(startPos, endPos, timelineWidth);
    }).catch(function (error) {
        console.error('Error loading the CSV file:', error);
    });
});
