import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fl_chart/fl_chart.dart';

class StockCard extends StatefulWidget {
  final String symbol;
  final String? name;
  final VoidCallback? onAddFavorite;
  final VoidCallback? onRemoveFavorite;
  final VoidCallback? onSymbolClick;

  const StockCard({
    Key? key,
    required this.symbol,
    this.name,
    this.onAddFavorite,
    this.onRemoveFavorite,
    this.onSymbolClick,
  }) : super(key: key);

  @override
  _StockCardState createState() => _StockCardState();
}

class _StockCardState extends State<StockCard> {
  bool loading = true;
  String? error;
  List<Earnings> earnings = [];

  @override
  void initState() {
    super.initState();
    fetchEarnings();
  }

  Future<void> fetchEarnings() async {
    try {
      final response = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/stocks/${widget.symbol}'));

      if (response.statusCode != 200) {
        throw Exception('Unable to fetch earnings for ${widget.symbol}');
      }

      final data = jsonDecode(response.body);
      setState(() {
        earnings = List<Earnings>.from(
          data['earnings'].map((e) => Earnings.fromJson(e)),
        );
        earnings.sort((a, b) => a.fiscalDateEnding.compareTo(b.fiscalDateEnding));
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        loading = false;
      });
    }
  }

  Map<String, List<double>> _aggregateEarningsByYear() {
    final Map<String, List<double>> data = {};
    for (var e in earnings) {
      final year = e.fiscalDateEnding.substring(0, 4);
      final eps = double.tryParse(e.reportedEPS);
      if (eps != null) {
        data.putIfAbsent(year, () => []).add(eps);
      }
    }
    return data;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          StockCardInner(
            symbol: widget.symbol,
            name: widget.name,
            earnings: earnings,
            loading: loading,
            error: error,
            onAddFavorite: widget.onAddFavorite,
            onRemoveFavorite: widget.onRemoveFavorite,
            onSymbolClick: widget.onSymbolClick,
          )
        ],
      ),
    );
  }
}

class StockCardInner extends StatelessWidget {
  final String symbol;
  final String? name;
  final List<Earnings> earnings;
  final bool loading;
  final String? error;
  final VoidCallback? onAddFavorite;
  final VoidCallback? onRemoveFavorite;
  final VoidCallback? onSymbolClick;

  const StockCardInner({
    Key? key,
    required this.symbol,
    this.name,
    required this.earnings,
    required this.loading,
    required this.error,
    this.onAddFavorite,
    this.onRemoveFavorite,
    this.onSymbolClick,
  }) : super(key: key);

  Map<String, List<double>> _aggregateEarningsByYear() {
    final Map<String, List<double>> data = {};
    for (var e in earnings) {
      final year = e.fiscalDateEnding.substring(0, 4);
      final eps = double.tryParse(e.reportedEPS);
      if (eps != null) {
        data.putIfAbsent(year, () => []).add(eps);
      }
    }
    return data;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 8),
            Center(
              child: GestureDetector(
                onTap: () {
                  Navigator.pushNamed(context, '/stocks/$symbol');
                },
                child: Text(
                  "$symbol${name != null ? ' - $name' : ''}",
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                    color: Colors.blue,
                  ),
                ),
              ),
            ),
            if (loading) const CircularProgressIndicator(),
            if (error != null)
              Text(error!, style: const TextStyle(color: Colors.red)),
            if (!loading && error == null && earnings.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 16.0, bottom: 32.0),
                child: SizedBox(
                  height: 300,
                  child: Builder(
                    builder: (_) {
                      final yearly = _aggregateEarningsByYear();
                      final allYears = yearly.keys.toList()..sort();
                      final years = allYears.where((y) => int.tryParse(y) != null && int.parse(y) >= 2021).toList();
                      final averages = years.map((year) {
                        final values = yearly[year]!;
                        return values.reduce((a, b) => a + b) / values.length;
                      }).toList();
                      final spots = averages.asMap().entries.map(
                            (e) => FlSpot(e.key.toDouble(), e.value),
                      ).toList();

                      final minY = averages.reduce((a, b) => a < b ? a : b);
                      final maxY = averages.reduce((a, b) => a > b ? a : b);

                      return LineChart(
                        LineChartData(
                          minY: minY * 0.95,
                          maxY: maxY * 1.05,
                          titlesData: FlTitlesData(
                            topTitles: AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            rightTitles: AxisTitles(
                              sideTitles: SideTitles(showTitles: false),
                            ),
                            leftTitles: AxisTitles(
                              axisNameWidget: const Padding(
                                padding: EdgeInsets.only(right: 8),
                                child: Text("Reported EPS", style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              axisNameSize: 24,
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (value, meta) {
                                  if (value == minY * 0.95 || value == maxY * 1.05) {
                                    return Text(value.toStringAsFixed(1));
                                  }
                                  return const Text('');
                                },
                                reservedSize: 40,
                              ),
                            ),
                            bottomTitles: AxisTitles(
                              axisNameWidget: const Padding(
                                padding: EdgeInsets.only(top: 10),
                                child: Text("Fiscal Date Ending", style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              axisNameSize: 30,
                              sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 40,
                                getTitlesWidget: (value, meta) {
                                  final index = value.toInt();
                                  if (index >= 0 && index < years.length) {
                                    return Text(
                                      years[index],
                                      style: const TextStyle(fontSize: 10),
                                    );
                                  }
                                  return const Text('');
                                },
                                interval: 1,
                              ),
                            ),
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
                            )
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
            if (onAddFavorite != null)
              ElevatedButton(
                onPressed: onAddFavorite,
                child: const Text('Add to Favorites'),
              ),
            if (onRemoveFavorite != null)
              ElevatedButton(
                onPressed: onRemoveFavorite,
                child: const Text('Remove from Favorites'),
              ),
          ],
        ),
      ),
    );
  }
}

class Earnings {
  final String fiscalDateEnding;
  final String reportedEPS;

  Earnings({required this.fiscalDateEnding, required this.reportedEPS});

  factory Earnings.fromJson(Map<String, dynamic> json) {
    return Earnings(
      fiscalDateEnding: json['fiscalDateEnding'],
      reportedEPS: json['reportedEPS'],
    );
  }
}