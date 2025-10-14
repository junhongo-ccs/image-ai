import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'dart:html' as html show window;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '画像読み取りくん',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const ImageDescriptionPage(),
    );
  }
}

class ImageDescriptionPage extends StatefulWidget {
  const ImageDescriptionPage({super.key});

  @override
  State<ImageDescriptionPage> createState() => _ImageDescriptionPageState();
}

class _ImageDescriptionPageState extends State<ImageDescriptionPage> {
  Uint8List? _imageBytes;
  String? _description;
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();
  bool _isMobile = false;

  @override
  void initState() {
    super.initState();
    _checkIfMobile();
  }

  void _checkIfMobile() {
    if (kIsWeb) {
      final userAgent = html.window.navigator.userAgent.toLowerCase();
      setState(() {
        _isMobile = userAgent.contains('mobile') || 
                    userAgent.contains('android') || 
                    userAgent.contains('iphone') ||
                    userAgent.contains('ipad');
      });
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      final bytes = await image.readAsBytes();
      setState(() {
        _imageBytes = bytes;
        _description = null;
      });
    }
  }

  Future<void> _takePhoto() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.camera);
    
    if (image != null) {
      final bytes = await image.readAsBytes();
      setState(() {
        _imageBytes = bytes;
        _description = null;
      });
    }
  }

  Future<void> _generateDescription() async {
    if (_imageBytes == null) return;

    // SnackBarで分析中メッセージを表示
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('📸 画像分析中です...しばらくお待ちください'),
        duration: Duration(seconds: 30),
      ),
    );

    setState(() {
      _isLoading = true;
      _description = null;
    });

    try {
      final base64Image = base64Encode(_imageBytes!);
      
      final response = await http.post(
        Uri.parse('/api/describe'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'image': base64Image}),
      );

      // 分析完了したらSnackBarを閉じる
      ScaffoldMessenger.of(context).hideCurrentSnackBar();

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _description = data['description'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _description = 'エラー: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      // エラー時もSnackBarを閉じる
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      
      setState(() {
        _description = 'エラーが発生しました: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('📷 画像読み取りくん'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_imageBytes != null)
              Container(
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.memory(
                    _imageBytes!,
                    fit: BoxFit.contain,
                  ),
                ),
              )
            else
              Container(
                height: 300,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('画像が選択されていません'),
                ),
              ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _pickImage,
                    icon: const Icon(Icons.image),
                    label: const Text(
                      '画像を選択',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isMobile ? _takePhoto : null,
                    icon: const Icon(Icons.camera_alt),
                    label: const Text(
                      'カメラ撮影',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      backgroundColor: _isMobile ? null : Colors.grey[300],
                      foregroundColor: _isMobile ? null : Colors.grey[600],
                    ),
                  ),
                ),
              ],
            ),
            if (!_isMobile)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  '※ カメラ撮影はモバイル端末でのみ利用可能です',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontStyle: FontStyle.italic,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: _imageBytes != null && !_isLoading
                  ? _generateDescription
                  : null,
              icon: const Icon(Icons.auto_awesome),
              label: const Text(
                '説明を生成',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            const SizedBox(height: 24),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_description != null)
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.auto_awesome, color: Colors.blue),
                          const SizedBox(width: 8),
                          const Text(
                            'AI生成の説明:',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      MarkdownBlock(
                        data: _description!,
                        config: MarkdownConfig(
                          configs: [
                            H1Config(
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            H2Config(
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            H3Config(
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                            PConfig(
                              textStyle: const TextStyle(
                                fontSize: 16,
                                height: 1.6,
                                color: Colors.black87,
                              ),
                            ),
                            PreConfig(
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              padding: const EdgeInsets.all(16),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
