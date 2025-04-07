import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';

class StockInfoPage extends StatefulWidget {
  final String symbol;
  const StockInfoPage({Key? key, required this.symbol}) : super(key: key);

  @override
  State<StockInfoPage> createState() => _StockInfoPageState();
}

class _StockInfoPageState extends State<StockInfoPage> {
  bool loading = true;
  String? error;
  Map<String, dynamic>? stockData;

  @override
  void initState() {
    super.initState();
    fetchStockData();
  }

  Future<void> fetchStockData() async {
    try {
      final response = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/stocks/${widget.symbol}'));

      if (response.statusCode != 200) {
        throw Exception("Error: ${response.statusCode}");
      }

      setState(() {
        stockData = jsonDecode(response.body);
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Widget buildChart({
    required String title,
    required List<dynamic> data,
    required String xField,
    required String yField,
    required String yLabel,
    required String xLabel,
  }) {
    final Map<String, List<double>> grouped = {};

    for (var entry in data) {
      final rawDate = entry[xField];
      final value = double.tryParse(entry[yField].toString()) ?? 0.0;

      if (rawDate != null && rawDate is String && value != 0.0) {
        final year = rawDate.substring(0, 4);
        final yearInt = int.tryParse(year);
        if (yearInt != null && yearInt >= DateTime.now().year - 4) {
          grouped.putIfAbsent(year, () => []).add(value);
        }
      }
    }

    final sortedYears = grouped.keys.toList()..sort();
    final averages = sortedYears.map((year) {
      final values = grouped[year]!;
      return values.reduce((a, b) => a + b) / values.length;
    }).toList();

    final spots = averages.asMap().entries.map(
          (e) => FlSpot(e.key.toDouble(), e.value),
    ).toList();

    if (sortedYears.isEmpty || spots.isEmpty) return const SizedBox();

    final minY = averages.reduce((a, b) => a < b ? a : b);
    final maxY = averages.reduce((a, b) => a > b ? a : b);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 24),
        Center(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Theme.of(context).colorScheme.onBackground,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 40),
          child: SizedBox(
            height: 300,
            child: LineChart(
              LineChartData(
                minY: minY * 0.95,
                maxY: maxY * 1.05,
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    axisNameWidget: Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: Text(yLabel),
                    ),
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        if (value == 0 || value == (averages.length - 1)) {
                          return Text((minY + (maxY - minY) * (value / (averages.length - 1))).toStringAsFixed(1));
                        }
                        return const Text('');
                      },
                      reservedSize: 40,
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    axisNameWidget: Padding(
                      padding: const EdgeInsets.only(top: 24),
                      child: Text(xLabel),
                    ),
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index >= 0 && index < sortedYears.length) {
                          return Text(sortedYears[index]);
                        }
                        return const Text('');
                      },
                      reservedSize: 40,
                      interval: 1,
                    ),
                  ),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: const Border(
                    left: BorderSide(color: Colors.black),
                    bottom: BorderSide(color: Colors.black),
                  ),
                ),
                gridData: FlGridData(show: true),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    barWidth: 2,
                    dotData: FlDotData(show: true),
                    belowBarData: BarAreaData(show: false),
                    color: Colors.blue,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Stock Info")),
        body: Center(child: Text(error!)),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text("${widget.symbol} Stock Info")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          children: [
            buildChart(
              title: "Earnings (Reported EPS)",
              data: stockData!['earnings'],
              xField: 'fiscalDateEnding',
              yField: 'reportedEPS',
              yLabel: 'EPS',
              xLabel: 'Fiscal Date Ending',
            ),
            buildChart(
              title: "Dividends",
              data: stockData!['dividends'],
              xField: 'ex_dividend_date',
              yField: 'amount',
              yLabel: 'Amount',
              xLabel: 'Ex-Dividend Date',
            ),
            buildChart(
              title: "Income Statement (Net Income)",
              data: stockData!['incomeStatements'],
              xField: 'fiscalDateEnding',
              yField: 'netIncome',
              yLabel: 'Net Income',
              xLabel: 'Fiscal Date Ending',
            ),
            buildChart(
              title: "Balance Sheet (Total Assets)",
              data: stockData!['balanceSheets'],
              xField: 'fiscalDateEnding',
              yField: 'totalAssets',
              yLabel: 'Total Assets',
              xLabel: 'Fiscal Date Ending',
            ),
            buildChart(
              title: "Cash Flow (Net Income)",
              data: stockData!['cashFlows'],
              xField: 'fiscalDateEnding',
              yField: 'netIncome',
              yLabel: 'Net Income',
              xLabel: 'Fiscal Date Ending',
            ),
          ],
        ),
      ),
    );
  }
}
