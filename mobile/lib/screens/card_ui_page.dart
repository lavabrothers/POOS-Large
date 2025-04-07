import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class CardUIPage extends StatefulWidget {
  const CardUIPage({super.key});

  @override
  State<CardUIPage> createState() => _CardUIPageState();
}

class _CardUIPageState extends State<CardUIPage> {
  String userId = '';
  String firstName = '';
  String lastName = '';
  String message = '';
  String searchResults = '';
  String cardList = '';
  String search = '';
  String card = '';

  final searchController = TextEditingController();
  final cardController = TextEditingController();

  @override
  void initState() {
    super.initState();
    loadUserData();
  }

  Future<void> loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user_data');

    if (userString != null && userString.isNotEmpty) {
      final ud = jsonDecode(userString);
      setState(() {
        userId = ud['id'] ?? ud['_id'];
        firstName = ud['firstName'];
        lastName = ud['lastName'];
      });
    } else {
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  Future<void> addCard() async {
    final payload = jsonEncode({'userId': userId, 'card': card});
    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/api/addcard'),
        headers: {'Content-Type': 'application/json'},
        body: payload,
      );

      final res = jsonDecode(response.body);
      setState(() {
        message = res['error'] != null && res['error'].isNotEmpty
            ? "API Error: ${res['error']}"
            : 'Card has been added';
      });
    } catch (e) {
      setState(() {
        message = e.toString();
      });
    }
  }

  Future<void> searchCard() async {
    final payload = jsonEncode({'userId': userId, 'search': search});
    try {
      final response = await http.post(
        Uri.parse('http://localhost:5000/api/searchcards'),
        headers: {'Content-Type': 'application/json'},
        body: payload,
      );

      final res = jsonDecode(response.body);
      final List<dynamic> results = res['results'];

      setState(() {
        searchResults = 'Card(s) have been retrieved';
        cardList = results.join(', ');
      });
    } catch (e) {
      setState(() {
        searchResults = e.toString();
        cardList = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Card UI')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Search:"),
            TextField(
              controller: searchController,
              decoration: const InputDecoration(
                hintText: 'Card to Search For',
              ),
              onChanged: (val) => setState(() => search = val),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: searchCard,
              child: const Text('Search Card'),
            ),
            const SizedBox(height: 8),
            Text(searchResults, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(cardList),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 16),
            const Text("Add:"),
            TextField(
              controller: cardController,
              decoration: const InputDecoration(
                hintText: 'Card to Add',
              ),
              onChanged: (val) => setState(() => card = val),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: addCard,
              child: const Text('Add Card'),
            ),
            const SizedBox(height: 8),
            Text(message, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
