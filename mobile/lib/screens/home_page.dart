import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/stock_list.dart';
import '../services/alter_fav.dart';
import '../widgets/stock_card.dart';
import 'login_screen.dart';
import 'favorites_page.dart';
import 'stock_info_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Map<String, String>> stocks = [];
  bool loading = true;
  String? error;
  String? addError;
  String? name;
  late String userId;

  int currentPage = 0;
  final int itemsPerPage = 4;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    initUserAndFetchStocks();
  }

  void goToFavorites() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const FavoritesPage()),
    );
  }

  void goToStockInfoPage(String symbol) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StockInfoPage(symbol: symbol),
      ),
    );
  }

  void goBackToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  Future<void> initUserAndFetchStocks() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user_data') ?? '';

    if (userString.isEmpty) {
      goBackToLogin();
      return;
    }

    try {
      final user = jsonDecode(userString);
      name = user['firstName'];
      userId = user['_id'];
      await fetchStocksAndFavorites();
    } catch (e) {
      setState(() {
        error = "Failed to parse user data.";
        loading = false;
      });
    }
  }

  Future<void> fetchStocksAndFavorites() async {
    try {
      final stocksResponse =
      await http.get(Uri.parse('http://134.122.3.46:3000/api/stocks'));

      if (stocksResponse.statusCode != 200) {
        throw Exception("Stocks API error: ${stocksResponse.statusCode}");
      }

      final stocksData =
      List<Map<String, dynamic>>.from(jsonDecode(stocksResponse.body));

      final favResponse = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/favorites/search?userId=$userId'));

      Set<String> favoriteSymbols = {};

      if (favResponse.statusCode == 200) {
        final favData = jsonDecode(favResponse.body);
        favoriteSymbols = Set<String>.from(
          favData['stocks'].map((fav) => fav['symbol']),
        );
      }

      final filtered = stocksData
          .where((s) => !favoriteSymbols.contains(s['symbol']))
          .map((s) => {
        'symbol': s['symbol'].toString(),
        'name': s['name']?.toString() ?? '',
      })
          .toList();

      setState(() {
        stocks = filtered;
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = "Error fetching stocks: ${e.toString()}";
        loading = false;
      });
    }
  }

  Future<void> addFavorite(Map<String, String> stock) async {
    setState(() {
      addError = null;
    });

    final success = await alterFav('a', userId, stock['symbol'] ?? '');

    if (success) {
      setState(() {
        stocks.removeWhere((s) => s['symbol'] == stock['symbol']);
      });
    } else {
      setState(() {
        addError = "Error adding favorite.";
      });
    }
  }

  void _changePage(int newPage) {
    setState(() {
      currentPage = newPage;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
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
        appBar: AppBar(title: const Text("Home Page")),
        body: Center(child: Text(error!)),
      );
    }

    final totalPages = (stocks.length / itemsPerPage).ceil();
    final currentStocks =
    stocks.skip(currentPage * itemsPerPage).take(itemsPerPage).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text("Welcome, $name!"),
        actions: [
          IconButton(
            onPressed: goToFavorites,
            icon: const Icon(Icons.star),
            tooltip: 'Favorites',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            if (addError != null)
              Text(addError!, style: const TextStyle(color: Colors.red)),
            Expanded(
              child: currentStocks.isNotEmpty
                  ? ListView.builder(
                controller: _scrollController,
                itemCount: currentStocks.length,
                itemBuilder: (context, index) {
                  final stock = currentStocks[index];
                  return StockCard(
                    symbol: stock['symbol']!,
                    name: stock['name'],
                    onAddFavorite: () => addFavorite(stock),
                    onSymbolClick: () => goToStockInfoPage(stock['symbol']!),
                  );
                },
              )
                  : const Center(
                child: Text("No favorites to add."),
              ),
            ),
            if (totalPages > 1)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: currentPage > 0
                        ? () => _changePage(currentPage - 1)
                        : null,
                    child: const Text("Previous"),
                  ),
                  Text("Page ${currentPage + 1} of $totalPages"),
                  TextButton(
                    onPressed: currentPage < totalPages - 1
                        ? () => _changePage(currentPage + 1)
                        : null,
                    child: const Text("Next"),
                  ),
                ],
              )
          ],
        ),
      ),
    );
  }
}
