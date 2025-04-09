import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../widgets/stock_card.dart';
import 'home_page.dart';

class FavoritesPage extends StatefulWidget {
  const FavoritesPage({super.key});

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  List<dynamic> favorites = [];
  bool loading = true;
  String? error;
  String name = '';
  String userId = '';

  int currentPage = 0;
  final int itemsPerPage = 4;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    loadUserAndFetchFavorites();
  }

  Future<void> loadUserAndFetchFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user_data');

    if (userString == null || userString.isEmpty) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/');
      }
      return;
    }

    final user = jsonDecode(userString);
    name = user['firstName'];
    userId = user['_id'];

    await fetchFavorites();
  }

  Future<void> fetchFavorites() async {
    try {
      final response = await http.get(Uri.parse(
          'http://134.122.3.46:3000/api/favorites/search?userId=$userId'));

      if (response.statusCode != 200) {
        throw Exception('HTTP error: ${response.statusCode}');
      }

      final data = jsonDecode(response.body);
      setState(() {
        favorites = data['stocks'];
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = "Error fetching favorites";
        loading = false;
      });
    }
  }

  Future<void> removeFavorite(Map<String, dynamic> stock) async {
    try {
      final response = await http.put(
        Uri.parse('http://134.122.3.46:3000/api/favorites/remove'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'userId': userId, 'symbol': stock['symbol']}),
      );

      if (!response.statusCode.toString().startsWith('2')) {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Error removing favorite');
      }

      setState(() {
        favorites.removeWhere((s) => s['symbol'] == stock['symbol']);
      });

      // Return true to signal HomePage to refresh its data
      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Failed to remove favorite: $e")),
      );
    }
  }

  void goToStockInfo(String symbol) {
    Navigator.pushNamed(context, '/stocks/$symbol');
  }

  void _changePage(int newPage) {
    setState(() {
      currentPage = newPage;
      _scrollController.animateTo(0,
          duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
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
        appBar: AppBar(title: const Text('Favorites')),
        body: Center(child: Text(error!)),
      );
    }

    final totalPages = (favorites.length / itemsPerPage).ceil();
    final currentFavorites =
    favorites.skip(currentPage * itemsPerPage).take(itemsPerPage).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Favorites')),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            const SizedBox(height: 16),
            Expanded(
              child: currentFavorites.isNotEmpty
                  ? ListView.builder(
                controller: _scrollController,
                itemCount: currentFavorites.length,
                itemBuilder: (context, index) {
                  final stock = currentFavorites[index];
                  return StockCard(
                    symbol: stock['symbol'],
                    name: stock['name'],
                    onRemoveFavorite: () => removeFavorite(stock),
                    onSymbolClick: () => goToStockInfo(stock['symbol']),
                  );
                },
              )
                  : const Center(child: Text("No favorites added.")),
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
