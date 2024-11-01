from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def create_room(request):
    try:
        data = json.loads(request.body)
        room_id = data.get('room_id')
        if not room_id:
            return JsonResponse({'error': 'Room ID is required'}, status=400)
        return JsonResponse({'room_id': room_id})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

@csrf_exempt
@require_http_methods(["GET"])
def check_room(request, room_id):
    return JsonResponse({'exists': True})
