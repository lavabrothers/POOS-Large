import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

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
  String stockName = '';

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

      final decoded = jsonDecode(response.body);
      String name = decoded['name'] ?? '';

      if (name.isEmpty) {
        final backup = await http.get(Uri.parse(
            'http://134.122.3.46:3000/api/stockInfo?ticker=${widget.symbol}'));
        if (backup.statusCode == 200) {
          final backupData = jsonDecode(backup.body);
          name = backupData['short name'] ?? '';
        }
      }

      setState(() {
        stockData = decoded;
        stockName = name;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Widget buildLineChart(String title, List<dynamic> data, String xField, String yField) {
    final Map<int, double> yearToValue = {};

    for (var entry in data) {
      final rawDate = entry[xField];
      final year = int.tryParse(rawDate?.substring(0, 4) ?? '');
      final value = double.tryParse(entry[yField]?.toString() ?? '0') ?? 0.0;

      if (year != null && year >= 2020 && year <= 2024) {
        yearToValue[year] = value;
      }
    }

    final sortedYears = yearToValue.keys.toList()..sort();
    final values = sortedYears.map((y) => yearToValue[y]!).toList();

    if (values.isEmpty) return const SizedBox();
    final minY = values.reduce((a, b) => a < b ? a : b);
    final maxY = values.reduce((a, b) => a > b ? a : b);

    final yLabel = title.contains('Earnings')
        ? 'EPS'
        : title.contains('Income Statement')
        ? 'Net Income'
        : title.contains('Dividends')
        ? 'Amount'
        : 'Value';

    return Column(
      children: [
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.only(bottom: 10.0),
          child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 500,
          child: LineChart(
            LineChartData(
              minY: minY,
              maxY: maxY,
              lineBarsData: [
                LineChartBarData(
                  spots: List.generate(values.length, (i) => FlSpot(i.toDouble(), values[i])),
                  isCurved: true,
                  barWidth: 3,
                  dotData: FlDotData(show: true),
                  color: Colors.lightBlueAccent,
                )
              ],
              titlesData: FlTitlesData(
                topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 1,
                    getTitlesWidget: (value, meta) {
                      final index = value.toInt();
                      return index >= 0 && index < sortedYears.length
                          ? Text(sortedYears[index].toString(), style: const TextStyle(color: Colors.white))
                          : const Text('');
                    },
                    reservedSize: 32,
                  ),
                ),
                leftTitles: AxisTitles(
                  axisNameWidget: Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Text(yLabel, style: const TextStyle(color: Colors.white)),
                  ),
                  axisNameSize: 30,
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      if (value == minY || value == maxY) {
                        final formatted = NumberFormat.compact().format(value);
                        return Text(formatted, style: const TextStyle(color: Colors.white));
                      }
                      return const Text('');
                    },
                    reservedSize: 50,
                  ),
                ),
              ),
              gridData: FlGridData(show: true),
              borderData: FlBorderData(show: false),
            ),
          ),
        ),
      ],
    );
  }

  Widget buildBarChart(String title, List<dynamic> data, String xField, String yField) {
    final Map<int, double> yearToValue = {};

    for (var entry in data) {
      final rawDate = entry[xField];
      final year = int.tryParse(rawDate?.substring(0, 4) ?? '');
      final value = double.tryParse(entry[yField]?.toString() ?? '0') ?? 0.0;

      if (year != null && year >= 2020 && year <= 2024) {
        yearToValue[year] = value;
      }
    }

    final sortedYears = yearToValue.keys.toList()..sort();
    final values = sortedYears.map((y) => yearToValue[y]!).toList();

    if (values.isEmpty) return const SizedBox();
    final minY = values.reduce((a, b) => a < b ? a : b);
    final maxY = values.reduce((a, b) => a > b ? a : b);

    return Column(
      children: [
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.only(bottom: 10.0),
          child: Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        ),
        SizedBox(
          height: 500,
          child: BarChart(
            BarChartData(
              maxY: maxY,
              minY: minY,
              barGroups: List.generate(values.length, (i) {
                return BarChartGroupData(x: i, barRods: [
                  BarChartRodData(toY: values[i], color: Colors.lightBlueAccent, width: 18)
                ]);
              }),
              titlesData: FlTitlesData(
                topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 1,
                    getTitlesWidget: (value, meta) {
                      final index = value.toInt();
                      return index >= 0 && index < sortedYears.length
                          ? Text(sortedYears[index].toString(), style: const TextStyle(color: Colors.white))
                          : const Text('');
                    },
                    reservedSize: 32,
                  ),
                ),
                leftTitles: AxisTitles(
                  axisNameWidget: const Padding(
                    padding: EdgeInsets.only(right: 8),
                    child: Text("Dividends", style: TextStyle(color: Colors.white)),
                  ),
                  axisNameSize: 30,
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      return value == minY || value == maxY
                          ? Text(value.toStringAsFixed(1), style: const TextStyle(color: Colors.white))
                          : const Text('');
                    },
                    reservedSize: 40,
                  ),
                ),
              ),
              gridData: FlGridData(show: true),
              borderData: FlBorderData(show: false),
            ),
          ),
        ),
      ],
    );
  }

  Widget buildPieChart(String title, Map<String, double> sections) {
    final total = sections.values.fold(0.0, (a, b) => a + b);
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.cyan,
      Colors.red,
      Colors.grey
    ];

    final pieSections = sections.entries.toList().asMap().entries.map((entry) {
      final index = entry.key;
      final label = entry.value.key;
      final value = entry.value.value;
      final percentage = value / total * 100;
      return PieChartSectionData(
        value: value,
        color: colors[index % colors.length],
        title: '${percentage.toStringAsFixed(1)}%',
        radius: 130,
        titleStyle: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black),
        showTitle: true,
      );
    }).toList();

    return Column(
      children: [
        const SizedBox(height: 24),
        Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(
          height: 480,
          child: PieChart(
            PieChartData(
              sections: pieSections,
              sectionsSpace: 2,
              centerSpaceRadius: 50,
              borderData: FlBorderData(show: false),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 24,
          runSpacing: 10,
          alignment: WrapAlignment.center,
          children: sections.entries.toList().asMap().entries.map((entry) {
            final index = entry.key;
            final label = entry.value.key;
            final color = colors[index % colors.length];
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 14, height: 14, color: color),
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(color: Colors.white))
              ],
            );
          }).toList(),
        )
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

    final balanceSheet = stockData!['balanceSheets'].isNotEmpty
        ? stockData!['balanceSheets'][0]
        : {};

    final pieData = {
      "Cash": double.tryParse(balanceSheet['cashAndShortTermInvestments']?.toString() ?? '0') ?? 0.0,
      "Inventory": double.tryParse(balanceSheet['inventory']?.toString() ?? '0') ?? 0.0,
      "PPE": double.tryParse(balanceSheet['propertyPlantEquipment']?.toString() ?? '0') ?? 0.0,
      "Long-Term Investments": double.tryParse(balanceSheet['longTermInvestments']?.toString() ?? '0') ?? 0.0,
      "Goodwill": double.tryParse(balanceSheet['goodwill']?.toString() ?? '0') ?? 0.0,
      "Intangible": double.tryParse(balanceSheet['intangibleAssets']?.toString() ?? '0') ?? 0.0,
    };

    final totalUsed = pieData.values.fold(0.0, (a, b) => a + b);
    final totalAssets = double.tryParse(balanceSheet['totalAssets']?.toString() ?? '0') ?? 0.0;
    pieData['Other Assets'] = totalAssets - totalUsed;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          "${widget.symbol} - ${stockName.isNotEmpty ? stockName : 'Loading...'}",
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          children: [
            buildLineChart(
              "Earnings (Reported EPS)",
              stockData!['earnings'],
              'fiscalDateEnding',
              'reportedEPS',
            ),
            buildBarChart(
              "Dividends",
              stockData!['dividends'],
              'ex_dividend_date',
              'amount',
            ),
            buildLineChart(
              "Income Statement (Net Income)",
              stockData!['incomeStatements'],
              'fiscalDateEnding',
              'netIncome',
            ),
            buildPieChart(
              "Balance Sheet Breakdown (Total Assets)",
              pieData,
            ),
          ],
        ),
      ),
    );
  }
}
